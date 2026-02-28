"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RearrangeDrill } from "@/lib/types";
import { GripVertical, CheckCircle2, Sparkles } from "lucide-react";

interface SortableItemProps {
  id: string;
  text: string;
  isSubmitted?: boolean;
  isCorrect?: boolean;
}

function SortableItem({ id, text, isSubmitted, isCorrect }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isSubmitted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      className={`relative group flex items-start gap-4 p-5 border-2 rounded-2xl transition-all ${
        isDragging ? "opacity-50 scale-102 rotate-1" : ""
      } ${
        isSubmitted
          ? isCorrect
            ? "bg-[#D1FAE5] border-[#10B981]"
            : "bg-red-50 border-red-500"
          : "bg-card border-foreground"
      }`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        boxShadow: isDragging
          ? "none"
          : isSubmitted
            ? "none"
            : "4px 4px 0px 0px var(--foreground)",
      }}
    >
      <div
        {...attributes}
        {...listeners}
        className={`mt-1 p-1 rounded-lg transition-colors shrink-0 ${
          isSubmitted
            ? "opacity-0 cursor-default"
            : "hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground"
        }`}
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <p className="font-bold text-foreground leading-relaxed">{text}</p>
    </div>
  );
}

interface RearrangeDrillProps {
  drill: RearrangeDrill;
  onComplete: (score: number, order: any[]) => void;
  onShowResults?: () => void;
  isAiGenerated?: boolean;
}

export function RearrangeDrillComponent({
  drill,
  onComplete,
  onShowResults,
  isAiGenerated,
}: RearrangeDrillProps) {
  const [items, setItems] = useState(drill.shuffledVerses);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    items.forEach((item, index) => {
      if (item.originalIndex === index) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / items.length) * 100);
    setScore(calculatedScore);
    setIsSubmitted(true);
    onShowResults?.();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-foreground">Rearrange</h2>
            {isAiGenerated && (
              <span className="flex items-center gap-1 px-2 py-0.5 mt-1 text-[10px] font-black uppercase rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
                <Sparkles className="w-2.5 h-2.5" /> AI
              </span>
            )}
          </div>
          <div className="px-4 py-1.5 rounded-full bg-primary/10 border-2 border-primary text-primary font-black text-xs uppercase shadow-[2px_2px_0px_0px_var(--foreground)]">
            {drill.passage.reference}
          </div>
        </div>
        <p className="text-muted-foreground font-medium text-lg">
          Drag the verses into their correct chronological order.
        </p>
      </div>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  isSubmitted={isSubmitted}
                  isCorrect={item.originalIndex === index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-center pt-8">
        {isSubmitted ? (
          <div className="space-y-4 w-full text-center">
            <div
              className="rounded-2xl bg-card border-2 border-foreground p-6"
              style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-black text-foreground">
                  {score}/100
                </span>
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                {score === 100
                  ? "Perfect sequence! Your context recall is impeccable."
                  : score >= 50
                    ? "Good effort. Review this passage again!"
                    : "You might want to practice this one again."}
              </p>
            </div>

            <button
              onClick={() => onComplete(score, items)}
              className="w-full py-4 rounded-full bg-primary text-white font-bold text-base border-2 border-foreground hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              style={{ boxShadow: "4px 4px 0px 0px var(--foreground)" }}
            >
              Complete Drill →
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            className="group relative px-10 py-4 bg-primary text-white font-black text-xl rounded-2xl border-2 border-foreground hover:translate-y-[-4px] active:translate-y-0 transition-all"
            style={{
              boxShadow: "0px 8px 0px 0px var(--foreground)",
            }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              Check Sequence
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
