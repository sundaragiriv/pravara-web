# Database Migration Instructions

## Issue Summary
The application code and database schema were mismatched for the `shortlists` table:
- **App uses**: `added_by_email` (TEXT field to track who added the shortlist)
- **DB had**: Only `shortlisted_by` (UUID field)

## Fix Required

### 1. Run the Migration
Execute this migration in your Supabase SQL editor:

```sql
-- Add the missing column
ALTER TABLE shortlists ADD COLUMN IF NOT EXISTS added_by_email TEXT;

-- Update RLS policy to allow collaborators (removes status='accepted' requirement for now)
DROP POLICY IF EXISTS "Users can add to shortlists" ON shortlists;

CREATE POLICY "Users can add to shortlists"
  ON shortlists FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM collaborators 
      WHERE collaborator_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND user_id = shortlists.user_id
    )
  );

-- Fix delete policy
DROP POLICY IF EXISTS "Users can delete their shortlists" ON shortlists;

CREATE POLICY "Users can delete their shortlists"
  ON shortlists FOR DELETE
  USING (
    user_id = auth.uid() OR 
    shortlisted_by = auth.uid() OR
    added_by_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
```

### 2. New Feature: Invite Acceptance Page
Created `/kutumba` page where collaborators can:
- See pending invitations
- Accept or reject Guardian Mode access
- Automatically redirects to dashboard after acceptance

### 3. Testing Checklist

**Dashboard:**
- [ ] Star button shows filled/unfilled based on shortlist state
- [ ] Clicking star adds to shortlist (optimistic UI)
- [ ] Clicking filled star removes from shortlist
- [ ] Filter sidebar works (age, location, community)
- [ ] Match scores display correctly

**Profile View:**
- [ ] Match score badge displays
- [ ] Guna score badge displays
- [ ] Star button toggles on/off
- [ ] "Send Interest" button works

**Shortlist Tab:**
- [ ] Shows all starred profiles
- [ ] Remove button (X) works
- [ ] Family recommendations show badge
- [ ] View Profile links work

**Collaborator System:**
- [ ] Settings page has invite form (KutumbaInvite component)
- [ ] Sending invite creates pending record
- [ ] Invited user visits `/kutumba` to see invites
- [ ] Accepting invite enables Guardian Mode
- [ ] Guardian can star profiles for family member
- [ ] Guardians don't see Requests/Connections tabs

## Next Steps
1. Run migration in Supabase SQL editor
2. Test shortlist toggle on dashboard
3. Send test invite to another account
4. Accept invite at `/kutumba`
5. Verify Guardian Mode works correctly
