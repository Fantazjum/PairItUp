import { AnswerType } from "../enums/answer-type.enum";
import { ErrorType } from "../../shared/enums/error-type.enum";

export interface WebSocketResponse {
    answer?: AnswerType,
    error?: ErrorType,
    roomId?: string,
}