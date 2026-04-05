import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  UsePipes,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoriesDto,
  CategoryResponseDto,
} from './dto/category.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ResponseDto } from '../../common/dto/response.dto';
import { ApiSuccessResponse } from '../../common/decorators/swagger.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('分类管理')
@ApiBearerAuth()
@Controller('api/blog/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('add')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '添加分类' })
  @ApiSuccessResponse({ type: CategoryResponseDto, description: '添加成功' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoryService.create(createCategoryDto);
    return ResponseDto.success(data, '添加分类成功');
  }

  @Delete('delete')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '批量删除分类' })
  async remove(@Body() deleteCategoriesDto: DeleteCategoriesDto) {
    await this.categoryService.removeMany(deleteCategoriesDto);
    return ResponseDto.success(null, '删除分类成功');
  }

  @Put('update/:id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '修改分类' })
  @ApiParam({ name: 'id', description: '待修改的分类ID' })
  @ApiSuccessResponse({ type: CategoryResponseDto, description: '修改成功' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoryService.update(id, updateCategoryDto);
    return ResponseDto.success(data, '修改分类成功');
  }

  @Get('list')
  @Public()
  @ApiOperation({ summary: '查询所有分类' })
  @ApiSuccessResponse({
    type: CategoryResponseDto,
    isArray: true,
    description: '查询成功',
  })
  async findAll() {
    const data = await this.categoryService.findAll();
    return ResponseDto.success(data, '查询分类列表成功');
  }
}
