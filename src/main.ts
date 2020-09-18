import * as core from '@actions/core'
import * as github from '@actions/github'
import * as Webhooks from '@octokit/webhooks'

async function run(): Promise<void> {
  try {
    if (github.context.eventName === 'pull_request') {
      console.log('Running add patch notes...')
      const { pull_request } = github.context.payload as Webhooks.EventPayloads.WebhookPayloadPullRequest
      const patchNotesRegex = /<!-- Patch Note Start -->\r*\n*([a-z\r\n\s:]+)\r*\n*<!-- Patch Note End -->|<!-- Patch Note Start -->\r*\n*(n\/a)\r*\n*<!-- Patch Note End -->/
      const [ match, patchNotes ] = patchNotesRegex.exec(pull_request.body) || []
      if (!match) {
        throw Error('Could not find patch notes in the pull request body. Please use the format `n/a` or `{type}: {notes}`.')
      }
      if (match && patchNotes === 'n/a') {
        console.log('Found n/a, so no patch notes are necessary.')
        core.setOutput("patchNotes", [])
        return
      }

      const results = []

      const patchNoteRegex = /^([a-z]+)(\([a-z]+\))?:\s?(.+)\./
      for (const patchNote of patchNotes.split('\r\n')) {
        const [ match, type, context, body ] = patchNoteRegex.exec(patchNote) || []
        if (!match) {
          throw Error(`Malformed patch note (${patchNote}). Please use the format \`{type}: {notes}\`.`)
        }
        results.push({
          type,
          context: context?.slice(1, -1),
          body
        })
      }

      core.setOutput("patchNotes", results)
    } else {
      throw Error('This action must be run in a pull request event.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
