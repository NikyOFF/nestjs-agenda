<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec"><img src="https://img.shields.io/badge/Donate-PayPal-dc3d53.svg"/></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description
[Agenda](https://www.npmjs.com/package/agenda) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
$ npm i --save nestjs-agenda-module agenda
```

Once the installation process is complete, we can import the AgendaModule into the root AppModule.

```ts
import { Module } from '@nestjs/common';
import { AgendaModule } from 'nestjs-agenda-module';

@Module({
  imports: [
    AgendaModule.forRoot({
        db: { address: 'MONGO_CONNECTION_URI' },
    }),
  ],
})
export class AppModule {}
```

## Defining Job Processors

Before you can use a job, you must define its processing behavior.

For do this you need create `jobs-processor`

```ts
import { JobProcessors } from 'nestjs-agenda-module';

@JobProcessors()
export class ExampleJobProcessors {}
```

And then you can define `job-processor` with special decorator

**@JobProcessor(jobName, [options])**

```ts
import { JobProcessors, Processor } from 'nestjs-agenda-module';

@JobProcessors()
export class ExampleJobProcessors {
    @Processor("EXAMPLE_JOB")
    public async exampleJob() {}
}
```
Also you can get access to current `job` data or `done` function with `job context`

```ts
import { Job } from 'agenda';
import {
    JobProcessor,
    Processor,
    Context,
    JobContext
} from 'nestjs-agenda-module';

interface ExampleJobData {
    message: string;
}

@JobProcessors()
export class ExampleJobProcessors {
    @Processor('EXAMPLE_JOB')
    public async exampleJob(
        @Context() context: JobContext<ExampleJobData>,
    ) {
        const job: Job = context.job;
        const done: Function = context.done;

        console.log(job.attrs.data.message);

        done();
    }
}
```

## Provide job processors

```ts
import { Module } from '@nestjs/common';
import { AgendaModule } from 'nestjs-agenda-module';
import { ExampleJobProcessors } from './example.job-processors.ts';

@Module({
  imports: [
    TelegrafModule.forRoot({
        db: { address: 'MONGO_CONNECTION_URI' },
    }),
  ],
  providers: [ExampleJobProcessors],
})
export class AppModule {}
```

## Create job

```ts
import { Inject, Injectable } from '@nestjs/common';
import { Agenda } from 'agenda';
import { InjectAgenda } from 'nestjs-agenda-module';

@Injectable()
export class ExampleService {
    public constructor(
        @InjectAgenda()
        private readonly agenda: Agenda,
    ) {}

    public async createJob(): Promise<void> {
        this.agenda.every('15 minutes', 'EXAMPLE_JOB', { message: 'text' });
        this.agenda.schedule('1 day', 'EXAMPLE_JOB', { message: 'text' });
        this.agenda.now('EXAMPLE_JOB', { message: 'text' });

        //etc
    }
}
```