import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import TaskList from "./TaskList";

const meta: Meta<typeof TaskList> = {
  title: "Components/TaskList",
  component: TaskList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TaskList>;

export const Empty: Story = {
  args: {
    initialTasks: [],
  },
};

export const WithTasks: Story = {
  args: {
    initialTasks: [
      {
        id: "1",
        title: "Complete project setup",
        completed: true,
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "2",
        title: "Add MUI components",
        completed: false,
        createdAt: new Date("2024-01-02"),
      },
      {
        id: "3",
        title: "Configure Storybook",
        completed: false,
        createdAt: new Date("2024-01-03"),
      },
    ],
  },
};

export const AllCompleted: Story = {
  args: {
    initialTasks: [
      {
        id: "1",
        title: "Setup Next.js",
        completed: true,
        createdAt: new Date("2024-01-01"),
      },
      {
        id: "2",
        title: "Add Apollo Client",
        completed: true,
        createdAt: new Date("2024-01-02"),
      },
    ],
  },
};
