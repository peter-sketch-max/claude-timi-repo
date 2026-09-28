# Low Poly Pack for Roblox Studio

- `LowPolyPack.fbx`: all 40 models in one file, laid out on a grid.
- `models/*.fbx`: one file per model, if you only want some of them.
- `palette.png`: the colour texture. It's already embedded in the FBX files; this copy is a backup.
- `AnchorAll.lua`: an optional command-bar script to run after importing.

## Import
1. In Roblox Studio open **File > Import 3D** (or **Avatar > Import 3D**) and pick `LowPolyPack.fbx`.
2. In the importer, set the file dimensions to **Studs** if it asks. A pine tree should be about 8 studs tall (a player is about 5).
3. Click **Import**. Each model becomes one MeshPart with its colours baked into the texture.
4. Optional: select the imported model and run `AnchorAll.lua` in the Command Bar so nothing falls over when you press Play.

Each model is under about 700 triangles, well below Roblox's 20k-per-mesh limit.
To rebuild these files after editing `../lowpoly_pack.py`, run `../export_roblox.py` in Blender.
