import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { PageModuleService } from './page-module.service';
import {
  CreatePageModuleDto,
  PageModuleResponseDto,
  UpdatePageModuleDto,
} from './dto/page-module.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResponseDto } from '../../common/dto/response.dto';
import { ApiSuccessResponse } from '../../common/decorators/swagger.decorator';

@ApiTags('首页模块管理')
@Controller('api/pageModule')
@ApiBearerAuth()
export class PageModuleController {
  constructor(private readonly pageModuleService: PageModuleService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '创建首页模块' })
  @ApiSuccessResponse({ type: PageModuleResponseDto, description: '添加成功' })
  async create(@Body() createPageModuleDto: CreatePageModuleDto) {
    const data = await this.pageModuleService.create(createPageModuleDto);
    return ResponseDto.success(data, '创建成功');
  }

  @Get()
  @ApiOperation({ summary: '获取所有首页模块' })
  @ApiSuccessResponse({
    type: PageModuleResponseDto,
    isArray: true,
    description: '获取成功',
  })
  async findAll() {
    const data = await this.pageModuleService.findAll();
    return ResponseDto.success(data, '获取成功');
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '更新首页模块' })
  @ApiSuccessResponse({
    type: PageModuleResponseDto,
    description: '更新首页模块成功',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePageModuleDto: UpdatePageModuleDto,
  ) {
    const data = await this.pageModuleService.update(id, updatePageModuleDto);
    return ResponseDto.success(data, '更新成功');
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除首页模块' })
  @ApiSuccessResponse({
    type: Object,
    description: '删除成功',
  })
  async remove(@Param('id') id: string) {
    await this.pageModuleService.remove(id);
    return ResponseDto.success(null, '删除成功');
  }
}
