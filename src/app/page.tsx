import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TaskList from "@/components/TaskList";
import { getTasks } from "@/app/actions/tasks";

export default async function Home() {
  const tasks = await getTasks();

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Pang Daily Planner
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center" gutterBottom>
          Plan your day, accomplish your goals
        </Typography>
        <TaskList initialTasks={tasks} />
      </Box>
    </Container>
  );
}
