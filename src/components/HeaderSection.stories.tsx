import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import HeaderSection from "./HeaderSection";
import dayjs from "dayjs";

const meta: Meta<typeof HeaderSection> = {
  title: "Components/HeaderSection",
  component: HeaderSection,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HeaderSection>;

export const Default: Story = {
  args: {
    date: dayjs("2024-01-15"),
    energyLevel: "8",
    mood: "Productive",
    datesWithPlans: ["2024-01-10", "2024-01-12", "2024-01-15"],
    loading: false,
    saving: false,
    onDateChange: () => {},
    onEnergyLevelChange: () => {},
    onMoodChange: () => {},
  },
};

export const Loading: Story = {
  args: {
    date: dayjs("2024-01-15"),
    energyLevel: "5",
    mood: "Focused",
    loading: true,
    saving: false,
    onDateChange: () => {},
    onEnergyLevelChange: () => {},
    onMoodChange: () => {},
  },
};

export const Saving: Story = {
  args: {
    date: dayjs("2024-01-15"),
    energyLevel: "10",
    mood: "Energized",
    loading: false,
    saving: true,
    onDateChange: () => {},
    onEnergyLevelChange: () => {},
    onMoodChange: () => {},
  },
};
