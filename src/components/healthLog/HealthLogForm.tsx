// HealthLogForm.tsx はフォーム部分のコンポーネントとして設計されていたため、
// 元の安定バージョンでは editTargetId などの状態管理は親で行い、
// このコンポーネントは props で受け取っていた形に戻します。

import React from "react";
import { Meds, PollenLevel } from "../../types";

type Props = {
  memo: string;
  meds: Meds;
  pollenLevel: PollenLevel | "";
  onMemoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMedsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPollenLevelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
  editTargetId?: string | null;
};

const HealthLogForm: React.FC<Props> = ({
  memo,
  meds,
  pollenLevel,
  onMemoChange,
  onMedsChange,
  onPollenLevelChange,
  onSave,
  onCancel,
  isSaving,
  editTargetId,
}) => {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave();
      }}
    >
      <textarea
        value={memo}
        onChange={onMemoChange}
        placeholder="メモ"
        rows={4}
        style={{ width: "100%" }}
      />
      <div>
        <label>
          <input
            type="checkbox"
            name="asacol"
            checked={meds.asacol}
            onChange={onMedsChange}
          />
          アサコール
        </label>
        <label>
          <input
            type="checkbox"
            name="clearmin"
            checked={meds.clearmin}
            onChange={onMedsChange}
          />
          クレアミン
        </label>
        <label>
          <input
            type="checkbox"
            name="ebios"
            checked={meds.ebios}
            onChange={onMedsChange}
          />
          エビオス
        </label>
      </div>
      <div>
        <select value={pollenLevel} onChange={onPollenLevelChange}>
          <option value="">花粉レベルを選択</option>
          <option value="none">なし</option>
          <option value="low">少ない</option>
          <option value="medium">普通</option>
          <option value="high">多い</option>
        </select>
      </div>
      <div>
        <button type="submit" disabled={isSaving}>
          {editTargetId ? "更新" : "保存"}
        </button>
        <button type="button" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </form>
  );
};

export default HealthLogForm;
