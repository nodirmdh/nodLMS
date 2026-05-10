import { Controller, Get, Param, Query } from '@nestjs/common';
import { Mentor, MentorStatus, User } from '@prisma/client';
import { MentorsService } from './mentors.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';

@ApiTags('Mentors')
@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @ApiOperation({ summary: 'Получить всех менторов' })
  @Get()
  findAll(
    @Query() filter: { courseId: number; status: string },
    @CurrentUser() user: User,
  ): Promise<Mentor[]> {
    return this.mentorsService.findAll(filter, user);
  }

  @ApiOperation({ summary: 'Получить список менторов (процентая зарплата)' })
  @Get('/percent-mentors')
  getPercentMentors(@CurrentUser() user: User) {
    return this.mentorsService.getPercentMentors(user);
  }

  @ApiOperation({ summary: 'Получить список менторов (select)' })
  @Get('/select')
  getSelect(@Query('status') status: MentorStatus, @CurrentUser() user: User) {
    return this.mentorsService.getSelect(status, user);
  }

  @ApiOperation({ summary: 'Получить ментора' })
  @Get('/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: User): Promise<Mentor> {
    console.log('sdsadsa');
    return this.mentorsService.findOne(+id, user);
  }
}
