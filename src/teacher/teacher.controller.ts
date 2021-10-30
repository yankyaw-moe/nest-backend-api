import { Controller, Get, Param, Put } from '@nestjs/common';

@Controller('teachers')
export class TeacherController {

    @Get()
    getTeachers() {
        return "Get Teachers";
    }

    @Get('/:teacherId')
    getTeacherById(
        @Param('teacherId') teacherId: string
    ) {
        return `Get Teacher By Id of ${teacherId}`;
    }

}
