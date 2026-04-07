import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  UsePipes,
  Delete,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import {
  CreateTagDto,
  UpdateTagDto,
  DeleteTagsDto,
  TagResponseDto,
} from './dto/tag.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ResponseDto } from '../../common/dto/response.dto';
import { ApiSuccessResponse } from '../../common/decorators/swagger.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('标签管理')
@ApiBearerAuth()
@Controller('api/blog/tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('add')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '添加标签' })
  @ApiSuccessResponse({ type: TagResponseDto, description: '添加成功' })
  async create(@Body() createTagDto: CreateTagDto) {
    const data = await this.tagService.create(createTagDto);
    return ResponseDto.success(data, '添加标签成功');
  }

  @Delete('delete')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '批量删除标签' })
  async remove(@Body() deleteTagsDto: DeleteTagsDto) {
    await this.tagService.removeMany(deleteTagsDto);
    return ResponseDto.success(null, '删除标签成功');
  }

  @Put('update/:id')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '修改标签' })
  @ApiParam({ name: 'id', description: '待修改的标签ID' })
  @ApiSuccessResponse({ type: TagResponseDto, description: '修改成功' })
  async update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    const data = await this.tagService.update(id, updateTagDto);
    return ResponseDto.success(data, '修改标签成功');
  }

  @Get('list')
  @Public()
  @ApiOperation({ summary: '查询所有标签' })
  @ApiQuery({ name: 'categoryId', required: false, description: '分类ID' })
  @ApiSuccessResponse({
    type: TagResponseDto,
    isArray: true,
    description: '查询成功',
  })
  async findAll(@Query('categoryId') categoryId?: string) {
    const data = await this.tagService.findAll(categoryId);
    return ResponseDto.success(data, '查询标签列表成功');
  }
}
