import { Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Submission, SubmissionDocument } from './schemas/submission.schema';
import { Model } from 'mongoose';
import { FormsService } from '../forms/forms.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require('jsonwebtoken');

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<SubmissionDocument>,
    private readonly formsService: FormsService,
  ) {}

  async create(createSubmissionDto: CreateSubmissionDto, token: string) {
    console.log('Creating submission: ', createSubmissionDto, token);
    let userId;
    let points = 0;
    try {
      const decoded = jwt.verify(token, 'THIS_IS_A_TOKEN_KEY');
      userId = decoded.sub;
      console.log("User id: ",userId);
    } catch (e: any) {
      console.log('Submission without user made: ', e.toString());
    } finally {
      const form = await this.formsService.findOne(createSubmissionDto.formId);
      points = form.points.value;
      console.log('Submission without user made');
    }
    const entity = new this.submissionModel({
      ...createSubmissionDto,
      userId,
      points,
    });
    entity.save();
    return entity;
  }

  async findAllPaginated(page: number, limit: number, submitted: string) {
    const items = await this.submissionModel
      .find({ submitted: submitted ? submitted === 'true' : true })
      .skip(limit * (page - 1)) // we will not retrieve all records, but will skip first 'n' records
      .limit(limit) // will limit/restrict the number of records to display
      .exec();
    const totalDocuments = await this.submissionModel.countDocuments();
    for (let i = 0; i < items.length; i++) {
      const form = await this.formsService.findOne(
        items[i].formId,
      );
      items[i].form = form;
    }
    const res = { totalDocuments, items, page, limit };
    return res;
  }

  async find(query) {
    const items = await this.submissionModel.find(query);
    return items;
  }

  findOne(id: number) {
    return `This action returns a #${id} submission`;
  }

  update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    return `This action updates a #${id} submission`;
  }

  remove(id: number) {
    return `This action removes a #${id} submission`;
  }
}
