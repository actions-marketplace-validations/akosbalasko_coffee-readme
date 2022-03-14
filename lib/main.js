"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fs = __importStar(require("fs"));
const updateFile_1 = require("./updateFile");
const util_1 = require("./util");
const PLACEHOLDER_START = '<!--START_SECTION:buy-me-a-coffee-->';
const PLACEHOLDER_END = '<!--END_SECTION:buy-me-a-coffe-->';
const coffeeAPI = require('buymeacoffee.js');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repo = core.getInput('REPOSITORY');
            console.debug('started, getting buyme token...');
            let coffeeToken = core.getInput('BUY_ME_A_COFFEE_TOKEN');
            const coffee = new coffeeAPI(coffeeToken); // add your token here
            console.debug('coffeeAPI connection established.');
            const supporters = yield coffee.Supporters();
            console.debug('getting github token');
            const octoToken = core.getInput('GH_TOKEN');
            const octokit = github.getOctokit(octoToken);
            console.debug('github connection establised.');
            const readme = yield octokit.rest.repos.getReadme({ owner: repo.split('/')[0], repo: repo.split('/')[1] });
            const decodedReadme = readme.data.content;
            const options = (0, util_1.getActionOptions)();
            const updater = new updateFile_1.Updater(options);
            const numberOfMessages = core.getInput('NUMBER_OF_MESSAGES');
            const messages = supporters.data.slice(0, numberOfMessages).map((supporter) => supporter.support_note).join('\n');
            const updateRegexp = new RegExp(`${PLACEHOLDER_START}[^\<]*${PLACEHOLDER_END}`, 'g');
            const updatedReadme = decodedReadme.replace(updateRegexp, `${PLACEHOLDER_START}${messages}${PLACEHOLDER_END}`);
            fs.writeFileSync('readme.md', updatedReadme);
            // await updater.updateFile('readme.md');
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();