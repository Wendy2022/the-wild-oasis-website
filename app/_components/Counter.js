"use client";

import { useState } from "react";

export default function Counter({ user }) {
  const [count, setCount] = useState(0);
  // console.log(user);
  return (
    <div>
      <p>there are {user.length} users</p>
      <button onClick={() => setCount((c) => c + 1)}>{count}</button>
    </div>
  );
}
