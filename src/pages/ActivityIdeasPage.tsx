import IdeasManager from '../components/IdeasManager'

export default function ActivityIdeasPage() {
  return (
    <IdeasManager
      pageTitle="What to Do?"
      ideaType="do"
      submitToggleLabel="Submit an Idea"
      titleLabel="Thing or Place"
      titlePlaceholder="e.g. Pooping at Home"
      notesPlaceholder="Lots of fibre!"
      titleRequiredMessage="Thing or Place is required."
    />
  )
}
