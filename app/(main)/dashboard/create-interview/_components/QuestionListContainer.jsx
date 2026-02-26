"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

export default function QuestionListContainer({ questionList, setQuestionList }) {
  const updateQuestion = (index, field, value) => {
    const next = [...(questionList || [])];
    next[index] = { ...(next[index] || {}), [field]: value };
    setQuestionList(next);
  };
  const remove = (index) => {
    setQuestionList(questionList.filter((_, i) => i !== index));
  };
  const add = () => {
    setQuestionList([...(questionList || []), { question: "", type: "General" }]);
  };

  if (!questionList?.length) return null;

  return (
    <div>
      <h2 className="font-bold text-large">Interview Questions</h2>
      <p className="text-primary text-sm mb-3">Edit, add, or remove questions before creating the interview link.</p>
      <div className="p-5 border border-gray-300 rounded-xl space-y-3">
        {(questionList || []).map((item, index) => (
          <div key={index} className="p-3 bg-white rounded-lg border flex gap-2 items-start">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Question"
                value={item.question || ""}
                onChange={(e) => updateQuestion(index, "question", e.target.value)}
                className="mb-1"
              />
              <p className="text-primary text-xs">Type: {item.type || "General"}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove">
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Add question
        </Button>
      </div>
    </div>
  );
}
