"use client";
import { useState } from "react";

export function PostCard({ post, onVote }: { post: any; onVote: (id: string, pts: number) => void }) {
  const [voting, setVoting] = useState(false);
  return (
    <div className="elraizer-card p-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{post.title}</h3>
          <p className="text-xs text-zinc-500">{post.category} • {post.profiles?.username} • {post.points_received} pts</p>
        </div>
        {post.is_marketplace && <span className="px-2 py-1 bg-[#00FF88] text-black text-xs font-bold rounded">${post.price}</span>}
      </div>
      <p className="mt-3 text-sm text-zinc-300 line-clamp-3">{post.content}</p>
      <div className="flex gap-2 mt-4">
        {[1,5,10].map(n => (
          <button key={n} disabled={voting} onClick={async ()=>{ setVoting(true); await onVote(post.id, n); setVoting(false); }} className="px-3 py-1 bg-zinc-800 rounded-full text-xs hover:bg-zinc-700">+{n} pts</button>
        ))}
      </div>
    </div>
  );
}
