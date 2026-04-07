import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { PageModuleService } from '../page-module/page-module.service';
import { HomeResponseDto, HomeUserDto } from './dto/home-response.dto';
import { PageModuleResponseDto } from '../page-module/dto/page-module.dto';

@Injectable()
export class HomeService {
  constructor(
    private readonly userService: UserService,
    private readonly pageModuleService: PageModuleService,
  ) {}

  /**
   * 获取首页聚合数据
   */
  async getHomeData(): Promise<HomeResponseDto> {
    const user = await this.userService.getBlogOwnerInfo();
    const modules = await this.pageModuleService.findActiveModules();

    return {
      user: user as HomeUserDto | null,
      pageModule: modules as PageModuleResponseDto[],
    };
  }
}
