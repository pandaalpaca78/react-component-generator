interface FriendsProps { small?: boolean }

export function Friends({ small = false }: FriendsProps) {
  return (
    <svg className={small ? 'friends friends--small' : 'friends'} viewBox="0 0 360 185" fill="none" aria-hidden="true">
      <ellipse cx="182" cy="166" rx="148" ry="11" fill="#EADFD5" opacity=".5" />
      <g stroke="#765B53" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M254 80C242 54 245 12 257 11C271 10 273 52 270 69M286 70C286 38 297 12 308 17C319 23 307 66 299 84" fill="#FFF0B6" />
        <path d="M244 88C252 60 293 60 308 85C323 110 321 149 304 158C288 170 251 167 240 151C229 134 232 106 244 88Z" fill="#FFF0B6" />
        <path d="M58 84L49 53Q49 43 60 47L81 60Q106 52 128 65L145 49Q153 44 154 55L151 90" fill="#C9E5F5" />
        <path d="M55 86C63 62 126 57 144 85C161 112 152 149 136 158C119 169 77 166 62 153C46 140 43 108 55 86Z" fill="#C9E5F5" />
        <path d="M135 83C121 74 125 55 139 54C152 52 157 62 157 68C169 64 183 64 197 69C196 54 210 49 219 56C231 65 223 78 219 82C236 108 233 143 219 157C204 171 158 171 143 157C127 142 122 106 135 83Z" fill="#FFFEF9" />
        <path d="M66 136L59 146M133 138L141 146M145 140L137 148M216 139L224 147M246 138L239 146M306 136L314 144" />
        <path d="M78 158L77 167L90 167M120 161L123 168L134 165M157 162L157 172L169 172M201 164L204 173L215 170M253 160L253 169L265 169M289 162L292 170L303 167" fill="#FFFEF9" />
        <path d="M88 112L88 116M116 112L116 116M164 112L164 116M194 112L194 116M260 110L260 114M289 110L289 114" strokeWidth="4.5" />
        <path d="M96 122Q102 129 108 122M173 123Q179 130 185 123M270 121Q276 128 282 121" />
      </g>
      <g fill="#F2ACA9" opacity=".7"><ellipse cx="77" cy="124" rx="9" ry="5"/><ellipse cx="127" cy="124" rx="9" ry="5"/><ellipse cx="151" cy="125" rx="9" ry="5"/><ellipse cx="207" cy="125" rx="9" ry="5"/><ellipse cx="249" cy="123" rx="8" ry="5"/><ellipse cx="300" cy="123" rx="8" ry="5"/></g>
      <g stroke="#C59F62" strokeWidth="2" strokeLinecap="round"><path d="M28 81V93M22 87H34M331 51V63M325 57H337M191 26V36M186 31H196"/></g>
      <path d="M92 30C84 20 72 33 92 44C112 33 100 20 92 30Z" fill="#ECA6B5"/>
    </svg>
  );
}
