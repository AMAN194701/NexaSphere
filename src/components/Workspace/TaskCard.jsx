export default function TaskCard({ task }) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <h3 className="font-bold">{task.title}</h3>
      <p>{task.description}</p>
      <span>{task.status}</span>
    </div>
  );
}