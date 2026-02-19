"use client";

export interface SavedPersonaItem {
  personaId: string;
  name: string;
  conversationCount: number;
  lastConversationAt: string;
}

interface SavedPersonaListProps {
  personas: SavedPersonaItem[];
  onResume: (personaId: string) => void;
}

export function SavedPersonaList({ personas, onResume }: SavedPersonaListProps) {
  if (personas.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
        아직 저장된 페르소나가 없어요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {personas.map((persona) => (
        <article
          key={persona.personaId}
          className="rounded-xl border border-gray-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-gray-900">{persona.name}</h3>
              <p className="text-xs text-gray-500">
                대화 {persona.conversationCount}회
              </p>
              <p className="text-xs text-gray-500">
                마지막 대화: {persona.lastConversationAt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onResume(persona.personaId)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
            >
              이어서 대화하기
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
