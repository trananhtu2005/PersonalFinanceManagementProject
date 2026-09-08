package com.personalfinance.api.dashboard.service.impl;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.personalfinance.api.dashboard.dto.response.AnalysisResponse;
import com.personalfinance.api.dashboard.service.AiService;
import com.personalfinance.exception.AppException;
import com.personalfinance.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final ObjectMapper objectMapper;
    private final Client geminiClient;

    @Override
    public String analyze(AnalysisResponse response) {
        try {
            String jsonData = objectMapper.writeValueAsString(response);
            String prompt = """
                    Bạn là AI chuyên phân tích tài chính cá nhân.
                    Hãy phân tích dữ liệu tài chính của người dùng dựa **chỉ trên dữ liệu JSON được cung cấp.
                    Nội dung cần phân tích
                    1. So sánh thu nhập, chi tiêu và tiết kiệm với tháng trước.
                    2. Xác định budget đã vượt mức và đưa ra cách hạn chế vượt budget.
                    3. Phân tích payment reminder và số dư dự kiến sau khi thanh toán.
                    4. Phân tích saving goal đang IN_PROGRESS, đánh giá tiến độ và khả năng đạt mục tiêu dựa trên tốc độ tiết kiệm hiện tại.
                    5. Phân tích category, xác định category chi tiêu nhiều và category nên tối ưu.
                    6. Phân tích transaction trong tháng, tập trung vào:
                       Khoản chi lớn.
                       Khoản chi lặp lại.
                       Khoản chi bất thường.
                       Khoản chi có thể cắt giảm.
                    7. Đề xuất cách tối ưu thu nhập, chi tiêu, tiết kiệm và ngân sách.
                    8. Đưa ra lời khuyên thực tế, ngắn gọn dựa trên dữ liệu.
                    Quy tắc bắt buộc:
                    Chỉ sử dụng số liệu có trong JSON.
                    Không được tự bịa hoặc suy đoán số liệu.
                    Nếu không đủ dữ liệu để phân tích một mục, hãy bỏ qua mục đó.
                    Không lặp lại dữ liệu không cần thiết.
                    Chỉ đưa ra những nhận xét có giá trị, không giải thích dài dòng.
                    Sử dụng số liệu cụ thể khi có thể.
                    Ưu tiên kết luận và đề xuất thay vì mô tả lại dữ liệu.
                    Giới hạn độ dài:
                    Tối đa 500 từ.
                    Tối đa 25 dòng.
                    Mỗi mục chỉ nên có 1–3 ý chính.
                    Mỗi ý tối đa 2 câu.
                    Không viết phần mở đầu hoặc kết luận dài.
                    Không nhắc lại toàn bộ dữ liệu JSON.
                    Định dạng trả lời:
                    Sử dụng đúng cấu trúc sau:
                    1. Tổng quan
                    ...
                    2. Budget
                    ...
                    3. Payment reminder
                    ...
                    4. Saving goal
                    ...
                    5. Category
                    ...
                    6. Transaction đáng chú ý
                    ...
                    7. Đề xuất
                    ...
                    8. Lời khuyên
                    ...
                    Dữ liệu tài chính:
                    %s
                    """.formatted(jsonData);
            GenerateContentResponse aiResponse = geminiClient.models
                    .generateContent("gemini-3.1-flash-lite", prompt, null);
            String text = aiResponse.text();

            if (text == null || text.isBlank()) {
                throw new AppException(ErrorCode.AI_ANALYSIS_FAILED);
            }

            return text;

        } catch (JacksonException e) {
            throw new AppException(ErrorCode.AI_ANALYSIS_FAILED);
        }
    }
}
