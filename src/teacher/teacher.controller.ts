import { Controller, Get, Param, Put } from '@nestjs/common';
import { FindTeacherResponseDto } from './dto/teacher.dto';

@Controller('teachers')
export class TeacherController {

    @Get()
    getTeachers(): FindTeacherResponseDto[] {
        return "Get Teachers";
    }

    @Get('/:teacherId')
    getTeacherById(
        @Param('teacherId') teacherId: string
    ): FindTeacherResponseDto {
        return `Get Teacher By Id of ${teacherId}`;
    }

}
