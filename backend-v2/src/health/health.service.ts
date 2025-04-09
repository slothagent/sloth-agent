import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private context = {
    twitterService: false,
    submissionService: false,
    distributionService: false,
  };

  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        twitter: this.context.twitterService ? 'up' : 'down',
        submission: this.context.submissionService ? 'up' : 'down',
        distribution: this.context.distributionService ? 'up' : 'down',
      },
    };
  }

  setTwitterService(status: boolean) {
    this.context.twitterService = status;
  }

  setSubmissionService(status: boolean) {
    this.context.submissionService = status;
  }

  setDistributionService(status: boolean) {
    this.context.distributionService = status;
  }
} 