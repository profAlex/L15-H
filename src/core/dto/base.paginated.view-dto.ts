//базовый класс view модели для запросов за списком с пагинацией
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedViewDto<T> {
    @ApiProperty({
        type: () => Object, // ленивый резолвер для Swagger
        isArray: true,
    })
    items: T[];
    totalCount: number;
    pagesCount: number;
    page: number;
    pageSize: number;

    constructor(data: {
        items: T[];
        page: number;
        size: number;
        totalCount: number;
    }) {
        this.totalCount = data.totalCount;
        this.pagesCount = Math.ceil(data.totalCount / data.size) || 1; // Защита от NaN, если size = 0
        this.page = data.page;
        this.pageSize = data.size;
        this.items = data.items;
    }

    public static mapToView<T>(data: {
        items: T[];
        page: number;
        size: number;
        totalCount: number;
    }): PaginatedViewDto<T> {
        return new PaginatedViewDto<T>(data);
    }
}
