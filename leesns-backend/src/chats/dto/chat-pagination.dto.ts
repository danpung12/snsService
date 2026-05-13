import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";;


export class ChatPaginationDto {

    @IsString()
    chatRoomId!: string;


    @IsString()
    @IsOptional()
    cursor?: string;

    @Type(()=> Number)
    @IsInt()
    @IsOptional()
    take: number = 20;

}