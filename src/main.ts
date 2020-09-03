import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks'

async function run(): Promise<void> {
  try {
    if (github.context.eventName === 'pull_request') {
      console.log('Running add patch notes...')
      const { pull_request } = github.context.payload as Webhooks.EventPayloads.WebhookPayloadPullRequest
      console.log('pull_request', JSON.stringify(pull_request))
      const patchNoteRegex = /<!-- Patch Note Start -->\r*\n*(.+):\s?(.+)\r*\n*<!-- Patch Note End -->/
      const [ _0, patchNoteType, patchNote ]= patchNoteRegex.exec(pull_request.body) || []
      if (patchNoteType && patchNote) {
        console.log('Found patch note type:', patchNoteType)
        console.log('Found patch note:', patchNote)
        core.setOutput("type", patchNoteType)
        core.setOutput("patchNote", patchNote)
      }
   }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
