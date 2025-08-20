# Business Plan Conversation Integration Tests

This document outlines manual test steps to verify the business plan conversation integration functionality.

## Test 1: Creating a New Conversation from ConversationsCard

1. Navigate to the business idea page
2. Verify the ConversationsCard is visible in the ProfileSidebar
3. Click the "New" button in the ConversationsCard
4. Verify:
   - A new conversation is created with title "New Business Plan"
   - The chatbox opens and displays the new conversation
   - The conversation appears in the ConversationsCard list

## Test 2: Creating a Business Plan Conversation from SuggestionCard

1. Navigate to the business idea page
2. Ensure there are business suggestions available (complete profile analysis if needed)
3. Click the "Create Implementation Plan" button on any SuggestionCard
4. Verify:
   - A new conversation is created with the business idea's title
   - The chatbox opens automatically
   - The conversation shows a streaming message with the plan content
   - The conversation appears in the ConversationsCard list

## Test 3: Switching Between Conversations

1. Create at least two conversations using methods from Test 1 and Test 2
2. In the ConversationsCard, click on different conversation items
3. Verify:
   - The active conversation changes in the chatbox
   - The correct messages are displayed for each conversation
   - The chatbox header title updates to reflect the active conversation

## Test 4: Legacy Single Message Mode

1. Clear all conversations (if possible) or use a fresh session
2. Use the chatbox for profile analysis without creating a conversation
3. Verify:
   - Messages appear in the chatbox without being part of a conversation
   - The chatbox functions correctly in legacy mode

## Test 5: Error Handling

1. Attempt to create a business plan with an invalid API key or model
2. Verify:
   - Appropriate error handling occurs
   - Error state is displayed correctly
   - The system doesn't crash

## Test 6: Streaming Performance

1. Create a business plan conversation
2. Observe the streaming behavior
3. Verify:
   - Text appears incrementally in real-time
   - Scrolling works correctly during streaming
   - The UI remains responsive during streaming

## Test 7: Conversation Persistence

1. Create multiple conversations
2. Refresh the page
3. Verify:
   - Conversations persist across page refreshes (if implemented)
   - Or verify graceful handling if persistence is not yet implemented
