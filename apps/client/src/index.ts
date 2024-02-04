#!/usr/bin/env node

import { Command } from 'commander';
import { auth } from './commands/auth.js';
import { projects } from './commands/projects.js';
import { users } from './commands/users.js';

const program = new Command()
    .name('yukactl')
    .description('Management tool for Yukako')
    .version('0.0.1')
    .addCommand(auth)
    .addCommand(projects)
    .addCommand(users);

program.parse();
