# Viewing Schematics in Storybook

## How to View the Schematics Tree

The Schematics tab shows version-grouped storyboards from the version registry. To see it in Storybook:

### Step 1: Open the Story
Navigate to: **TraceListPanel → WithSchematics**

### Step 2: Click the Schematics Tab
At the top of the panel, you'll see three tabs:
- **Traces** (default, shows trace list)
- **Configuration** (shows library.yaml editor)
- **Schematics** ← Click this one!

### Step 3: Explore the Tree
You should see a tree structure like:
```
🔀 example-org/ecommerce-platform@a1b2c3d4  ●
  └─ 📊 E-Commerce User Journey  ●
     └─ 📋 Storyboard
     └─ 📁 Workflows
        └─ ⚡ Authentication Workflow  ●
        └─ ⚡ Checkout Workflow  ●

🔀 example-org/ecommerce-platform@f1e2d3c4  ○
  └─ 📊 Admin Operations  ○
     └─ 📋 Storyboard
     └─ 📁 Workflows
        └─ ⚡ Product Management  ○

🔀 example-org/payment-service@f1e2d3c4  ○
  └─ 📊 Payment Processing  ○
     └─ 📋 Storyboard
     └─ 📁 Workflows
        └─ ⚡ Credit Card Payment  ○
```

### Step 4: Try the Filter
Check the **"Show only workflows with traces"** checkbox to see the filtering in action.

## Available Stories

### 1. **WithSchematics**
- Shows 3 versions with storyboards
- Some workflows have traces (●), some don't (○)
- Demonstrates basic tree structure

### 2. **SchematicsMultipleVersions**
- Shows filtering behavior more clearly
- Only one workflow has traces
- Use filter to see dramatic tree reduction

### 3. **SchematicsLoading**
- Shows loading state
- Useful for testing loading UX

## Troubleshooting

### "I don't see anything"
✅ Make sure you clicked the **Schematics** tab at the top of the panel

### "The tree is empty"
Check the browser console for errors. Common issues:
- Missing `@principal-ade/dynamic-file-tree` dependency
- Type mismatches in mock data
- React errors preventing render

### "Indicators don't show"
The ● and ○ indicators require:
- Mock traces with `matchedWorkflow.workflowId`
- Those IDs matching workflow IDs in the storyboards

### "Filter doesn't work"
The filter checkbox should be visible above the tree when schematics are loaded. If not:
- Check that `versionSnapshots.length > 0`
- Check browser console for errors

## Understanding the Mock Data

### Version Snapshots
Each `VersionSnapshot` contains:
- `repositoryUrl`: GitHub repo URL
- `commitSha`: Git commit hash
- `storyboards[]`: Array of `DiscoveredStoryboard` objects

### Storyboards
Each `DiscoveredStoryboard` contains:
- `id`, `name`, `path`, `basename`: Metadata
- `canvas`: Canvas definition
- `workflows[]`: Array of `DiscoveredWorkflow` objects

### Workflows
Each `DiscoveredWorkflow` contains:
- `id`: Workflow ID (used for trace matching)
- `name`: Display name
- `path`: File path
- `content` (optional): WorkflowTemplate with scenarios

### Traces for Indicators
Traces need:
```typescript
{
  matchedWorkflow: {
    workflowId: 'authentication-workflow', // Must match workflow.id
    workflowName: 'Authentication Workflow',
    scenarioId: 'happy-path-login',
  }
}
```

## Visual Legend

| Icon | Meaning |
|------|---------|
| 🔀 | Version (repo@commit) |
| 📊 | Storyboard |
| 📋 | Canvas/Storyboard file |
| 📖 | Overview/Documentation |
| 📁 | Workflows container |
| ⚡ | Individual workflow |
| ● | Has traces (green filled circle) |
| ○ | No traces (gray outline circle) |
| ✓ | Fully covered (green checkmark) |

## Next Steps

1. Try clicking on different nodes (workflows, storyboards)
2. Toggle the filter on/off
3. Open browser DevTools to see console logs
4. Expand/collapse different tree sections
5. Check the selection state (purple highlight)
