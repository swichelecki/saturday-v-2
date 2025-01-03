import connectDB from '../../config/db';
import Note from '../../models/Note';
import { Notes } from '../../components';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';

export const metadata = {
  title: 'Notes',
};

export const dynamic = 'force-dynamic';

async function getNotesData() {
  try {
    await connectDB();

    const { userId, admin } = await getUserFromCookie();

    const notesRaw = await Note.find({ userId }).sort({ date: -1 });
    const notes = JSON.parse(JSON.stringify(notesRaw));
    const pinnedNoteKey = 'Pinned';
    const thisYear = new Date().getFullYear();

    // create array of years in which notes were created before current year
    const notePastYears = notes.reduce((acc, note) => {
      const year = note?.date?.split('T')[0].split('-')[0];
      if (!acc.includes(year) && year !== String(thisYear)) acc.push(year);
      return acc;
    }, []);

    // create notes data structure
    let notesData = [{ Pinned: [] }, { [thisYear]: [] }];
    for (const year of notePastYears) {
      notesData = [...notesData, { [year]: [] }];
    }

    // add notes to data structure
    for (const note of notes) {
      for (const noteSegment of notesData) {
        // add pinned note
        if (Object.keys(noteSegment)[0] === pinnedNoteKey && note?.pinned) {
          Object.values(noteSegment)[0].push(note);
        }

        // add note by year
        if (
          Object.keys(noteSegment)[0] ===
            note?.date?.split('T')[0].split('-')[0] &&
          !note?.pinned
        ) {
          Object.values(noteSegment)[0].push(note);
        }
      }
    }

    // sort pinned items in descending order
    for (const note of notesData) {
      if (
        Object.keys(note)[0] === pinnedNoteKey &&
        Object.values(note)[0].length > 0
      ) {
        Object.values(note)[0] = Object.values(note)[0].sort(
          (a, b) => a?.pinnedDate + b?.pinnedDate
        );
      }
    }

    return {
      notes: notesData ?? [],
      user: { userId, admin },
    };
  } catch (error) {
    console.log(error);
  }
}

export default async function NotesPage() {
  const notesData = await getNotesData();
  const { notes, user } = notesData;

  return <Notes notes={notes} user={user} />;
}
