import { Controller, Get, Put } from '@nestjs/common';

@Controller('teachers')
export class TeacherController {

    @Get()
    getTeachers() {
        return "Get Teachers";
    }

    @Get('/:teacherId')
    getTeacherById() {
        return "Get Teacher By Id";
    }

}
