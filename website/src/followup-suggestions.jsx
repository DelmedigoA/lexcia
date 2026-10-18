// Adapted from assistant-ui Follow-up suggestions (runtime + paper-pill variants):
// https://www.assistant-ui.com/elements/follow-up-suggestions
// Copyright (c) 2026 AgentbaseAI Inc. MIT; see public/licenses/assistant-ui.txt.
import React from 'react';
import {AuiIf,ThreadPrimitive,useAuiState} from '@assistant-ui/react';

function FollowupRow(){
  const suggestions=useAuiState(s=>s.thread.suggestions);
  const isRunning=useAuiState(s=>s.thread.isRunning);
  return <nav className="followup-suggestions" aria-label="Suggested next steps" dir="auto">
    {suggestions.map(suggestion=><ThreadPrimitive.Suggestion
      key={suggestion.prompt} prompt={suggestion.prompt} send
      className="followup-suggestion" disabled={isRunning}
    >{suggestion.title??suggestion.prompt}</ThreadPrimitive.Suggestion>)}
  </nav>;
}
export function ThreadFollowupSuggestions(){
  return <AuiIf condition={s=>!s.thread.isEmpty&&s.thread.suggestions.length>0}>
    <FollowupRow/>
  </AuiIf>;
}
