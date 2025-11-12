export async function loadRoutesForUI() {
  const res = await fetch("http://localhost:4000/api/routes");
  return await res.json();
}
