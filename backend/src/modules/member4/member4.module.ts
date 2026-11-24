import { Module } from '@nestjs/common';
import { Member4Controller } from './member4.controller';
import { Member4Service } from './member4.service';

@Module({ controllers: [Member4Controller], providers: [Member4Service] })
export class Member4Module {}
