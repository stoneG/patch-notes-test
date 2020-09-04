import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks'

async function run(): Promise<void> {
  try {
    if (github.context.eventName === 'pull_request') {
      console.log('Running add patch notes...')
      const { pull_request } = github.context.payload as Webhooks.EventPayloads.WebhookPayloadPullRequest
      console.log('pull_request', JSON.stringify(pull_request))
      const patchNoteRegex = /<!-- Patch Note Start -->\r*\n*([a-z]+)\(?([a-z]+)\)?:\s?(.+)\r*\n*<!-- Patch Note End -->|<!-- Patch Note Start -->\r*\n*n\/ar*\n*<!-- Patch Note End -->/
      const [ match, type, context, note ]= patchNoteRegex.exec(pull_request.body) || []
      if (!match) {
        throw Error('Could not find patch note in the pull request body. Please use the format `n/a` or `{type}: {notes}`.')
      }
      if (match && (!type || !note)) {
        console.log('Found n/a, so no patch note is necessary.')
      }
      core.setOutput("type", type)
      core.setOutput("context", context)
      core.setOutput("note", note)
    } else {
      throw Error('This action must be run in a pull request event.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
