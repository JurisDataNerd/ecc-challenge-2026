(async () => {
 const {touchesTerrain}=await import('/src/game/terrain.ts');
 const {PARTICIPANT_STAGES}=await import('/src/data/participantStages.ts');
 const result=[];
 for(const stage of PARTICIPANT_STAGES){
  const img=new Image();img.src=stage.mapPath;await img.decode();
  const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);
  const pixels=ctx.getImageData(0,0,img.width,img.height).data;
  const blocked=p=>touchesTerrain(stage.ordinal,stage.mapScale,p,pixels,img.width,img.height);
  if(blocked(stage.spawn))throw new Error(`L${stage.ordinal} spawn is blocked`);
  const step=16,start={x:Math.round(stage.spawn.x/step)*step,y:Math.round(stage.spawn.y/step)*step};
  const queue=[start],seen=new Set([`${start.x},${start.y}`]);
  for(let i=0;i<queue.length;i++){
   const p=queue[i];
   for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
    const n={x:p.x+dx,y:p.y+dy},id=`${n.x},${n.y}`;
    if(n.x<20||n.y<20||n.x>stage.worldSize-20||n.y>stage.worldSize-20||seen.has(id)||blocked(n))continue;
    seen.add(id);queue.push(n);
   }
  }
  if(!queue.some(p=>Math.hypot(p.x-stage.board.x,p.y-stage.board.y)<90))throw new Error(`L${stage.ordinal} board is unreachable`);
  if(stage.ordinal===2 && !seen.has('928,880'))throw new Error('L2 ladder cannot reach its upper landing');
  if(stage.ordinal===3 && !seen.has('672,1072'))throw new Error('L3 bridge cannot reach the west bank');
  result.push({stage:stage.ordinal,spawnClear:true,boardReachable:true,reachablePoints:queue.length,ladderAndBridge:stage.ordinal===1?'not applicable':'reachable'});
 }
 return result;
})()
