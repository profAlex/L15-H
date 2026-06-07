//базовый класс view модели для запросов за списком с пагинацией
import {ApiProperty} from "@nestjs/swagger";

export abstract class PaginatedViewDto<T> {
    @ApiProperty({
        type: () => Object, // ленивый резолвер
        isArray: true,
    })
    abstract items: T[];
    totalCount: number;
    pagesCount: number;
    page: number;
    pageSize: number;

    // статический метод-утилита для мапинга
    public static mapToView<T>(data: {

        items: T[];
        page: number;
        size: number;
        totalCount: number;
    }): PaginatedViewDto<T> {
        return {
            totalCount: data.totalCount,
            pagesCount: Math.ceil(data.totalCount / data.size),
            page: data.page,
            pageSize: data.size,
            items: data.items,
        };
    }
}
