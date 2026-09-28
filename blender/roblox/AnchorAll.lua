-- Run in Roblox Studio after importing (optional).
-- 1. Select the imported model(s) in the Explorer.
-- 2. Paste this into View > Command Bar and press Enter.
-- It anchors every MeshPart so nothing falls over when you press Play.
-- If the colours didn't come in, upload palette.png (Asset Manager / Toolbox > Images),
-- copy its id, and paste it below like "rbxassetid://1234567890".
local TEXTURE_ID = ""

local ChangeHistoryService = game:GetService("ChangeHistoryService")
local count = 0
for _, root in ipairs(game:GetService("Selection"):Get()) do
	local parts = root:GetDescendants()
	table.insert(parts, root)
	for _, p in ipairs(parts) do
		if p:IsA("MeshPart") then
			p.Anchored = true
			if TEXTURE_ID ~= "" then
				p.TextureID = TEXTURE_ID
			end
			count += 1
		end
	end
end
ChangeHistoryService:SetWaypoint("LowPoly Pack fix")
print("LowPoly Pack: fixed " .. count .. " MeshParts")
