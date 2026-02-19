<template>
  <aside class="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
    <div class="p-6 border-b border-slate-200 dark:border-slate-800">
      <h2 class="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
        <span class="material-symbols-outlined text-amber-500">pending_actions</span>
        Pending Requests
        <span class="ml-auto bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">4</span>
      </h2>
    </div>
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Request Card 1 -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
        <div class="flex items-center gap-3 mb-3">
          <img class="size-8 rounded-full" alt="Employee profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkGQ5nYpGsx7ESIniutiMMnPgBo2Gz_mQBxziYqOGpUoOZGsPhQt-iY6ctDE4g2JOSvAdHIEVtae5T0D1x4RBs3Ko1x5hjtDFyQW77mz1HVQFS0QNxPqix_qDqn4jPb--K5hvzW_TrI8NlBZvaH4h0GO9SgF7QKk_ZagxX0ByZ0cD2j2QUib80XM9by1cujBUVtVxSw5n3mpgzjtUWLISElWPqfigBXF_4coXPEKR2IxPvhiYI5Q-XxORRoaJxJgtDLJih3vS9Npk"/>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold truncate">Linda Thompson</p>
            <p class="text-[10px] text-slate-500 font-medium">Shift Swap Request</p>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-lg p-2.5 mb-3 border border-slate-200 dark:border-slate-700">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[9px] font-bold text-slate-400 uppercase">From</span>
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">Oct 12, 08:00</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-[9px] font-bold text-slate-400 uppercase">To</span>
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">Oct 14, 16:00</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90">Approve</button>
          <button class="flex-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">Decline</button>
        </div>
      </div>
      <!-- Request Card 2 -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
        <div class="flex items-center gap-3 mb-3">
          <img class="size-8 rounded-full" alt="Employee profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBts-93aiVRjdAo3pbscAh-3DbsUrOfz9Juc8NO0K8j4XyJSsP8vzKloJL3COPV4-_3sk2m0BYNcN58S6uQN8abejSmWFITTzpRWobmvaTGuwcWLmC9ekX5G7JwGeFmVPre6seksAgXjsvNY4F0B6p_GxLkAu4dbr9HR4BszJf3n-uhLcWvfT8dMG_i5_S4QgM2f0LiFf1w4-vJtuotgRgk6_DCNNiVuyDa6LDSr9dNGvCqxLQe8Oun36XjAHfUTJobwvHJT8wpv3A"/>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold truncate">Robert Fox</p>
            <p class="text-[10px] text-slate-500 font-medium">Time-off (2 days)</p>
          </div>
        </div>
        <p class="text-[11px] text-slate-600 dark:text-slate-400 mb-3 italic">"Family emergency, need to travel out of state."</p>
        <div class="flex gap-2">
          <button class="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90">Approve</button>
          <button class="flex-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">Decline</button>
        </div>
      </div>
      <!-- Request Card 3 -->
      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
        <div class="flex items-center gap-3 mb-3">
          <img class="size-8 rounded-full" alt="Employee profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3kUa-xvmicdWevsW4SMXEn0j2Su6kX_VUVMNg95nXIWELhK6qD_e-LeaGqPFQrhO6mz0rQ_joLabBRBf2SGvNvBJX0TjqS6gdpHVfnGLa_zcWZ9XjUvXHpie_5sVuwWdaB3jJ5hCCrksbIkiU7-tJ6iQvEsxaArWhoQF22SK3o-G4XANIg-DxtFIo3uTeRyl1jTx6aOLlSqFdKvGwPdrJvHY7HQN1IAdyQQDLojpJyZVxIP7BJ_zjHXt_dwnz5nLLIXdloHOq2m4"/>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold truncate">Danny DeVito</p>
            <p class="text-[10px] text-slate-500 font-medium">Shift Coverage</p>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-800 rounded-lg p-2.5 mb-3 border border-slate-200 dark:border-slate-700">
          <div class="flex justify-between items-center">
            <span class="text-[9px] font-bold text-slate-400 uppercase">Shift</span>
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300">Oct 15, Night</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button class="flex-1 bg-primary text-white py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90">Approve</button>
          <button class="flex-1 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600">Decline</button>
        </div>
      </div>
    </div>
    <div class="p-6 border-t border-slate-200 dark:border-slate-800">
      <button class="w-full text-center text-xs font-bold text-primary hover:underline">View All Requests</button>
    </div>
  </aside>
</template>
