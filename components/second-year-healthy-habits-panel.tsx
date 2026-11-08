"use client";

import { useState } from "react";
import { Sa3HabitWorkspace } from "@/components/sa3-habit-workspace";
import { createSa3HabitsStore } from "@/lib/sa3-habits-store";

export function SecondYearHealthyHabitsPanel() {
  const [store] = useState(createSa3HabitsStore);
  return <Sa3HabitWorkspace store={store}/>;
}
