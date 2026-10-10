import type { OpenAiCallOptions, OpenAiCallResult, OpenAiUsage } from './ai.types';

// WHY: Phân loại model reasoning (o1, o3-mini, gpt-6-luna) cần xử lý riêng: role 'developer' thay vì 'system', max_completion_tokens thay vì max_tokens, reasoning_effort='low'.
export function isReasoningModel(modelName: string): boolean {
  const norm = (modelName || '').toLowerCase();
  return (
    norm.startsWith('o1') ||
    norm.startsWith('o3') ||
    norm.startsWith('o4') ||
    norm.includes('reasoning') ||
    norm.includes('luna') ||
    norm.startsWith('gpt-6') ||
    norm.startsWith('gpt-5')
  );
}

// WHY: Khử ký tự dòng mới nhằm ngăn chặn Log Injection (CWE-117).
export function sanitizeLog(input: string): string {
  if (!input) return '';
  return input.replace(/[\r\n\t]+/g, ' ').slice(0, 500);
}

interface OpenAiApiResponseChoice {
  finish_reason?: string;
  message?: {
    role?: string;
    content?: string | Array<{ type?: string; text?: string }>;
    refusal?: string | null;
  };
  text?: string;
}

interface OpenAiApiResponse {
  choices?: OpenAiApiResponseChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export class OpenAiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isTransient: boolean;

  constructor(message: string, code: string, statusCode = 500, isTransient = false) {
    super(message);
    this.name = 'OpenAiClientError';
    this.code = code;
    this.statusCode = statusCode;
    this.isTransient = isTransient;
  }
}

// WHY: Thực thi gọi OpenAI Chat Completions với cơ chế Fallback tham số, tự động chuyển đổi mô hình khi model không tồn tại và quản lý Timeout tường minh.
export async function callOpenAiWithResilience(
  apiKey: string,
  initialModel: string,
  systemPrompt: string,
  userPrompt: string,
  options: OpenAiCallOptions = {}
): Promise<OpenAiCallResult> {
  let model = initialModel?.trim() || 'gpt-4o-mini';
  const timeoutMs = options.timeoutMs ?? 90_000;
  const defaultTokenLimit = options.defaultTokenLimit ?? 2000;

  const buildPayload = (targetModel: string, includeTemperature = true, useMaxTokens = false): Record<string, unknown> => {
    const reasoning = isReasoningModel(targetModel);
    const systemRole = reasoning ? 'developer' : 'system';

    const tokenLimit = reasoning
      ? Math.max(options.maxTokens || defaultTokenLimit, 16000)
      : options.maxTokens || defaultTokenLimit;

    const payload: Record<string, unknown> = {
      model: targetModel,
      messages: [
        { role: systemRole, content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
    };

    if (useMaxTokens) {
      payload.max_tokens = tokenLimit;
    } else {
      payload.max_completion_tokens = tokenLimit;
    }

    if (!reasoning && includeTemperature) {
      payload.temperature = 0.7;
    }

    if (reasoning && (targetModel.startsWith('o3') || targetModel === 'o1' || targetModel.includes('luna'))) {
      payload.reasoning_effort = 'low';
    }

    return payload;
  };

  const executeFetch = async (payload: Record<string, unknown>): Promise<Response> => {
    // WHY: Egress Security & Timeout Guard - Giới hạn thời gian kết nối tránh nghẽn thread pool.
    const signal = AbortSignal.timeout(timeoutMs);
    return await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal,
    });
  };

  let openaiRes: Response;
  try {
    openaiRes = await executeFetch(buildPayload(model, true, false));
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError';
    const msg = isTimeout ? `OpenAI API request timed out sau ${timeoutMs / 1000}s` : (err instanceof Error ? err.message : 'Network error');
    throw new OpenAiClientError(msg, isTimeout ? 'OPENAI_TIMEOUT' : 'OPENAI_NETWORK_ERROR', 504, true);
  }

  // Fallback nếu API báo lỗi tham số hoặc model không tồn tại
  if (!openaiRes.ok) {
    const firstErrText = await openaiRes.text();
    console.warn(`[AI API] Lần gọi OpenAI đầu tiên thất bại (${openaiRes.status}):`, sanitizeLog(firstErrText));

    if (firstErrText.includes('model_not_found') || firstErrText.includes('does not exist')) {
      console.warn(`[AI API] Model "${model}" không tồn tại trên OpenAI, tự động thử lại với gpt-4o-mini...`);
      model = 'gpt-4o-mini';
      try {
        openaiRes = await executeFetch(buildPayload(model, true, false));
      } catch (err: unknown) {
        throw new OpenAiClientError('Lỗi kết nối khi gọi mô hình dự phòng gpt-4o-mini', 'OPENAI_FALLBACK_NETWORK_ERROR', 504, true);
      }
    } else if (
      firstErrText.includes('temperature') ||
      firstErrText.includes('unsupported_parameter') ||
      firstErrText.includes('response_format') ||
      firstErrText.includes('max_completion_tokens') ||
      firstErrText.includes('reasoning_effort') ||
      firstErrText.includes('developer')
    ) {
      const useMaxTokensFallback = firstErrText.includes('max_completion_tokens');
      const fallbackMessages = firstErrText.includes('developer')
        ? [{ role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }]
        : [
            { role: isReasoningModel(model) ? 'developer' : 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ];

      const fallbackPayload: Record<string, unknown> = {
        model: model || 'gpt-4o-mini',
        messages: fallbackMessages,
      };

      const tokenLimit = options.maxTokens || defaultTokenLimit;
      if (useMaxTokensFallback) {
        fallbackPayload.max_tokens = tokenLimit;
      } else {
        fallbackPayload.max_completion_tokens = tokenLimit;
      }

      try {
        openaiRes = await executeFetch(fallbackPayload);
      } catch (err: unknown) {
        throw new OpenAiClientError('Lỗi kết nối khi gửi yêu cầu dự phòng OpenAI', 'OPENAI_FALLBACK_NETWORK_ERROR', 504, true);
      }
    } else {
      let errJson: OpenAiApiResponse | null = null;
      try {
        errJson = JSON.parse(firstErrText) as OpenAiApiResponse;
      } catch {
        errJson = null;
      }

      const openAiErrMsg = errJson?.error?.message || `OpenAI API Error (${openaiRes.status}): ${firstErrText.slice(0, 200)}`;
      const isTransient = openaiRes.status === 429 || openaiRes.status >= 500;
      throw new OpenAiClientError(openAiErrMsg, 'OPENAI_API_ERROR', openaiRes.status >= 500 ? 502 : 400, isTransient);
    }
  }

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    let errJson: OpenAiApiResponse | null = null;
    try {
      errJson = JSON.parse(errText) as OpenAiApiResponse;
    } catch {
      errJson = null;
    }
    const openAiErrMsg = errJson?.error?.message || `OpenAI API Error (${openaiRes.status}): ${errText.slice(0, 200)}`;
    const isTransient = openaiRes.status === 429 || openaiRes.status >= 500;
    throw new OpenAiClientError(openAiErrMsg, 'OPENAI_API_ERROR', openaiRes.status >= 500 ? 502 : 400, isTransient);
  }

  const openaiData = (await openaiRes.json()) as OpenAiApiResponse;
  const choice = openaiData.choices?.[0];
  let aiContent = '';

  if (typeof choice?.message?.content === 'string') {
    aiContent = choice.message.content;
  } else if (Array.isArray(choice?.message?.content)) {
    aiContent = choice.message.content
      .map((part) => (typeof part === 'string' ? part : part?.text || ''))
      .join('');
  } else if (choice?.text) {
    aiContent = String(choice.text);
  }

  if (!aiContent || !aiContent.trim()) {
    const refusal = choice?.message?.refusal;
    const finishReason = choice?.finish_reason;
    console.error('[AI API Empty Response Detail]', {
      model,
      finishReason,
      refusal,
      usage: openaiData.usage,
    });

    let errMessage = 'Mô hình AI không trả về nội dung.';
    if (refusal) {
      errMessage = `Mô hình AI (${model}) từ chối tạo nội dung: "${refusal}"`;
    } else if (finishReason === 'length') {
      const reasoningTokens = openaiData.usage?.completion_tokens_details?.reasoning_tokens;
      errMessage = `Mô hình AI (${model}) đã đạt giới hạn token trước khi hoàn tất nội dung (finish_reason: length${
        reasoningTokens ? `, reasoning_tokens: ${reasoningTokens}` : ''
      }). Hãy thử đổi model sang gpt-4o-mini hoặc gpt-4o trong Cài đặt hệ thống.`;
    } else if (finishReason === 'content_filter') {
      errMessage = `Nội dung bị bộ lọc an toàn của OpenAI chặn (content_filter). Vui lòng điều chỉnh từ khóa hoặc yêu cầu.`;
    } else if (!choice) {
      errMessage = `OpenAI không trả về kết quả lựa chọn nào (choices rỗng). Model: ${model}.`;
    } else {
      errMessage = `Mô hình AI (${model}) trả về nội dung rỗng (finish_reason: ${finishReason || 'unknown'}).`;
    }

    throw new OpenAiClientError(errMessage, 'EMPTY_AI_RESPONSE', 500, false);
  }

  const usage: OpenAiUsage | undefined = openaiData.usage
    ? {
        promptTokens: openaiData.usage.prompt_tokens,
        completionTokens: openaiData.usage.completion_tokens,
        totalTokens: openaiData.usage.total_tokens,
      }
    : undefined;

  return {
    content: aiContent,
    model,
    usage,
  };
}
