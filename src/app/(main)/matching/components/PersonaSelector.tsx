"use client";

interface PersonaCard {
  id: string;
  name: string;
  ageGroup: string;
  jobCategory: string;
  stanceLabel: string;
  description: string;
}

interface PersonaSelectorProps {
  personas: PersonaCard[];
  onSelect: (personaId: string) => void;
  onRequestNotification?: () => void;
}

export function PersonaSelector({ personas, onSelect, onRequestNotification }: PersonaSelectorProps) {
  return (
    <div className="space-y-4" role="region" aria-label="AI 대화 상대 선택">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold">지금 대화할 수 있는 AI 상대를 선택하세요</h2>
        <p className="text-sm text-gray-500">실제 사람과 비슷한 대화를 연습할 수 있어요</p>
      </div>
      <div className="grid gap-3">
        {personas.map((p) => (
          <button
            key={p.id}
            className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
            onClick={() => onSelect(p.id)}
            aria-label={`${p.name}과 대화하기`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{p.ageGroup} · {p.jobCategory}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-gray-100">{p.stanceLabel}</span>
              </div>
              <span className="text-blue-600 text-sm font-medium">대화하기</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{p.description}</p>
          </button>
        ))}
      </div>
      {onRequestNotification && (
        <button
          className="w-full text-center text-sm text-gray-400 py-2"
          onClick={onRequestNotification}
        >
          실제 사람과 매칭되면 알림 받기
        </button>
      )}
    </div>
  );
}
