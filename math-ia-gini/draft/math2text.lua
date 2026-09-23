-- Written-text-only version: turn each inline formula into ordinary text,
-- using Unicode sub/superscripts where they exist.
local sub = {["0"]="₀",["1"]="₁",["2"]="₂",["3"]="₃",["4"]="₄",["5"]="₅",["6"]="₆",["7"]="₇",["8"]="₈",["9"]="₉",
  a="ₐ",e="ₑ",h="ₕ",i="ᵢ",j="ⱼ",k="ₖ",l="ₗ",m="ₘ",n="ₙ",o="ₒ",p="ₚ",r="ᵣ",s="ₛ",t="ₜ",u="ᵤ",v="ᵥ",x="ₓ"}
local sup = {["0"]="⁰",["1"]="¹",["2"]="²",["3"]="³",["4"]="⁴",["5"]="⁵",["6"]="⁶",["7"]="⁷",["8"]="⁸",["9"]="⁹",
  ["′"]="′",["″"]="″",n="ⁿ",p="ᵖ",i="ⁱ"}

local function convert(s, map, fallback)
  local out = ""
  for _, c in utf8.codes(s) do
    local ch = utf8.char(c)
    if not map[ch] then return fallback .. s end
    out = out .. map[ch]
  end
  return out
end

function Math(el)
  local txt = pandoc.write(pandoc.Pandoc({pandoc.Plain({el})}), 'plain')
  txt = txt:gsub('%s+$', ''):gsub('\n', ' ')
  txt = txt:gsub('_%(([^%)]+)%)', function(s) return convert(s, sub, '_') end)
  txt = txt:gsub('%^%(([^%)]+)%)', function(s) return convert(s, sup, '^') end)
  return pandoc.Str(txt)
end
