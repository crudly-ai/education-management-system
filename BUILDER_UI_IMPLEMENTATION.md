# Builder UI Implementation Guide

## Overview
Update the Crudly builder page UI to match the static HTML design while preserving all existing functionality.

## Target Changes
- ✅ Header redesign with hamburger menu and breadcrumbs
- ✅ AI Chat UI with message bubbles and action buttons
- ❌ Field Config tab (keep as-is)
- ❌ Preview area (keep as-is)
- ❌ All functionality (keep as-is)

---

## Phase 1: Header Update

### Files to Modify
- `resources/js/pages/crudly/builder/index.tsx`

### Current Header Location
```tsx
{/* Simple Header */}
<header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
```

### New Header Structure
```tsx
<header className="site-header bg-white lg:py-6 py-4 xl:px-5 px-4 border-b sticky z-20 top-0">
  <div className="flex items-center justify-between gap-2">
    <div className="flex flex-1 items-center xl:gap-[19px] gap-3">
      <div className="flex items-center xl:gap-5 gap-3">
        <button onClick={toggleFullscreenPreview}>
          {isFullscreenPreview ? (
            <svg className="w-5 h-5" /* Close icon SVG */>
          ) : (
            <svg className="w-5 h-5" /* Hamburger icon SVG */>
          )}
        </button>
        <div className="logo-col">
          <AppLogoIcon className="max-w-[85px] w-full" />
        </div>
      </div>
      <span className="text-[#E5E5E5] sm:block hidden">/</span>
      <div className="flex items-center gap-3">
        <span className="text-black font-medium xl:text-base text-sm lg:block hidden">
          {currentProject?.name || 'New Project'}
        </span>
        <svg className="md:w-[22px] md:h-[22px] w-4 h-4 sm:block hidden" /* Edit icon */>
      </div>
      <span className="text-[#E5E5E5] sm:block hidden">/</span>
      <button className="flex items-center gap-3" onClick={toggleFullscreenPreview}>
        <span className="text-black font-medium xl:text-base text-sm lg:block hidden">Full screen</span>
        <svg className="md:w-[22px] md:h-[22px] w-4 h-4 sm:block hidden" /* Fullscreen icon */>
      </button>
    </div>
    {/* Keep existing right side buttons */}
  </div>
</header>
```

### Required Icons (SVG)
- Hamburger menu icon
- Close icon  
- Edit icon
- Fullscreen icon

---

## Phase 2: AI Chat Message UI

### Files to Modify
- `resources/js/pages/crudly/builder/components/ai-chat.tsx`

### Current Message Structure
```tsx
<div className="space-y-4">
  {messages.map((message, index) => (
    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
```

### New Message Structure
```tsx
{/* User Message */}
<div className="msg-box send-msg max-w-[247px]">
  <div className="msg text-black p-2 text-xs bg-gray rounded-[10px] rounded-se-[3px] mb-[5px] w-fit">
    {message.content}
  </div>
  <div className="time-wrp flex items-center gap-2.5">
    <p className="flex items-center gap-[5px]">
      <Clock className="w-3.5 h-3.5" />
      <span className="text-[11px]">{formatTime(message.timestamp)}</span>
    </p>
    <div className="flex items-center gap-2.5">
      <button onClick={() => handleEdit(message.id)}>
        <Edit className="w-3.5 h-3.5 hover:text-black" />
      </button>
      <button onClick={() => handleDelete(message.id)}>
        <Trash2 className="w-3.5 h-3.5 hover:text-red-500" />
      </button>
      <button onClick={() => handleCopy(message.content)}>
        <Copy className="w-3.5 h-3.5 hover:text-black" />
      </button>
    </div>
  </div>
</div>

{/* AI Message */}
<div className="msg-box max-w-[247px]">
  {chatLoading && (
    <div className="building flex items-center text-xs gap-1.5 mb-2">
      <Sparkles className="w-3 h-3" />
      <span>Building...</span>
    </div>
  )}
  <div className="msg text-black p-2 text-xs bg-gray rounded-[10px] rounded-se-[3px] mb-[5px] w-fit">
    {/* Syntax highlighted command */}
    <SyntaxHighlighter code={message.content} />
  </div>
  <div className="time-wrp flex items-center gap-2.5">
    <div className="flex items-center gap-2.5">
      <button onClick={() => handleCopy(message.content)}>
        <Copy className="w-3.5 h-3.5 hover:text-black" />
      </button>
    </div>
    <p className="flex items-center gap-[5px]">
      <Clock className="w-3.5 h-3.5" />
      <span className="text-[11px]">{formatTime(message.timestamp)}</span>
    </p>
  </div>
</div>
```

### Required Functions
```tsx
const handleEdit = (messageId: string) => {
  // Edit message functionality
};

const handleDelete = (messageId: string) => {
  // Delete message functionality
};

const handleCopy = (content: string) => {
  navigator.clipboard.writeText(content);
  toast.success('Copied to clipboard!');
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};
```

---

## Phase 3: Suggestion Chips

### Location in AI Chat Component
Before the textarea input area:

```tsx
{/* Suggestion Chips */}
<div className="swiper input-suggest-slider my-[9px] px-3">
  <div className="flex gap-2 overflow-x-auto">
    {aiSuggestions.map((suggestion, index) => (
      <button
        key={index}
        onClick={() => setChatInput(suggestion)}
        className="text-[#A3A3A3] border leading-none py-2 px-[7px] text-[11px] rounded-full whitespace-nowrap hover:bg-gray-50"
      >
        {suggestion}
      </button>
    ))}
  </div>
</div>

{/* Existing textarea */}
<div className="relative bg-gray rounded-xl mx-3 mb-2 p-3">
  <textarea
    className="form-control md:text-base !p-0 !border-0 resize-none !bg-transparent !text-xs"
    rows={4}
    placeholder="Ask Crudly..."
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
  />
</div>
```

---

## Phase 4: Syntax Highlighting Component

### Create New Component
`resources/js/pages/crudly/builder/components/syntax-highlighter.tsx`

```tsx
interface SyntaxHighlighterProps {
  code: string;
}

export const SyntaxHighlighter = ({ code }: SyntaxHighlighterProps) => {
  const highlightCommand = (command: string) => {
    return command
      .replace(/php/g, '<span class="text-[#7A5AF8]">php</span>')
      .replace(/artisan/g, '<span class="text-[#0086C9]">artisan</span>')
      .replace(/make:crudly/g, '<span class="text-[#00BD00]">make:crudly</span>');
  };

  return (
    <div 
      className="font-mono text-xs"
      dangerouslySetInnerHTML={{ __html: highlightCommand(code) }}
    />
  );
};
```

---

## Phase 5: CSS Updates

### Create separate CSS file
`resources/css/builder.css`

```css
/* Builder UI Implementation CSS */

/* Header Styles */
.site-header {
  background: white;
  border-bottom: 1px solid #e5e5e5;
}

/* Message Styles */
.msg-box {
  margin-bottom: 10px;
}

.msg-box.send-msg {
  margin-left: auto;
}

.msg {
  background-color: #f5f5f5;
  border-radius: 10px;
  border-bottom-right-radius: 3px;
  padding: 8px;
  font-size: 12px;
  width: fit-content;
}

.time-wrp {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: #7c7c7c;
}

/* Suggestion Chips */
.input-suggest-slider {
  margin: 9px 0;
  padding: 0 12px;
}

/* Building Status */
.building {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #7c7c7c;
  margin-bottom: 8px;
}

/* Button styles and responsive design */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  background-color: #000;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .prompt-btn-wrp .btn span {
    display: none;
  }
}
```

### Import in builder component
`resources/js/pages/crudly/builder/index.tsx`

```tsx
// Import builder-specific CSS
import '../../../../css/builder.css';
```

---

## Implementation Checklist

### Phase 1: Header ✅ COMPLETED
- [x] Replace header structure
- [x] Add hamburger/close toggle
- [x] Add project breadcrumb
- [x] Add fullscreen button
- [x] Test responsive behavior

### Phase 2: AI Chat Messages ✅ COMPLETED
- [x] Update message bubble styling
- [x] Add timestamp display
- [x] Add action buttons (edit, delete, copy)
- [x] Add building status indicator
- [x] Test message interactions

### Phase 3: Suggestions ✅ COMPLETED
- [x] Add suggestion chips above input
- [x] Connect to existing aiSuggestions state
- [x] Test chip click functionality

### Phase 4: Syntax Highlighting ✅ COMPLETED
- [x] Create syntax highlighter component
- [x] Apply to AI command responses
- [x] Test color coding

### Phase 5: Styling ✅ COMPLETED
- [x] Add required CSS classes
- [x] Test responsive design
- [x] Verify color scheme matches

---

## Testing Strategy

1. **Functionality Test**: Ensure all existing features work
2. **UI Test**: Verify new design matches HTML mockup
3. **Responsive Test**: Check mobile/tablet layouts
4. **Integration Test**: Test with real AI responses

---

## Rollback Plan

If issues occur:
1. Git revert specific commits
2. Each phase is independent
3. Existing functionality preserved
4. CSS can be easily disabled

---

## Notes

- Keep all existing state management
- Preserve tour functionality
- Maintain auto-save behavior
- Don't modify Field Config tab
- Don't modify preview area
- All TypeScript types remain same