"""
Export the Low Poly Pack for Roblox Studio.

Roblox MeshParts use one texture each, so this script bakes every colour into a
small palette image and UV-maps each face onto its colour swatch. Output:

    roblox/LowPolyPack.fbx      all 40 models in one file (keeps the grid layout)
    roblox/models/<Name>.fbx    one file per model
    roblox/palette.png          the colour texture (embedded in the FBX files too)

Run it from Blender's Scripting tab (with lowpoly_pack.py next to this file), or
headless:  blender -b -P export_roblox.py
"""

import os
import sys

import bpy
from mathutils import Matrix

HERE = os.path.dirname(os.path.abspath(__file__)) if "__file__" in dir() else bpy.path.abspath("//")
sys.path.insert(0, HERE)
import lowpoly_pack as lp  # noqa: E402

OUT = os.path.join(HERE, "roblox")
SCALE = 3.0      # Blender units -> studs, so a tree is ~8 studs and a flower ~4
GRID = 8         # palette is GRID x GRID swatches
SWATCH = 16      # pixels per swatch (big enough that texture filtering never bleeds)


def make_palette(names):
    size = GRID * SWATCH
    img = bpy.data.images.new("LowPolyPalette", size, size, alpha=False)
    px = [0.0] * (size * size * 4)
    for k, name in enumerate(names):
        h = lp.PALETTE[name][0].lstrip("#")
        rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
        col, row = k % GRID, k // GRID
        for y in range(row * SWATCH, (row + 1) * SWATCH):
            for x in range(col * SWATCH, (col + 1) * SWATCH):
                i = (y * size + x) * 4
                px[i:i + 4] = rgb + [1.0]
    img.pixels.foreach_set(px)
    img.filepath_raw = os.path.join(OUT, "palette.png")
    img.file_format = "PNG"
    img.save()
    return img


def make_material(img):
    mat = bpy.data.materials.new("LowPolyPalette")
    if mat.node_tree is None:
        mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Roughness"].default_value = 0.8
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = img
    tex.interpolation = "Closest"
    mat.node_tree.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def bake_to_palette(obj, names, mat):
    mesh = obj.data
    swatch = {}
    for i, m in enumerate(mesh.materials):
        k = names.index(m.name[len("LP_"):])
        swatch[i] = ((k % GRID + 0.5) / GRID, (k // GRID + 0.5) / GRID)
    uv = mesh.uv_layers.new(name="UVMap")
    for poly in mesh.polygons:
        u, v = swatch[poly.material_index]
        for li in poly.loop_indices:
            uv.data[li].uv = (u, v)
    mesh.materials.clear()
    mesh.materials.append(mat)
    mesh.transform(Matrix.Scale(SCALE, 4))
    obj.location *= SCALE


def export_fbx(path, objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.export_scene.fbx(
        filepath=path, use_selection=True, object_types={"MESH"},
        apply_scale_options="FBX_SCALE_UNITS", mesh_smooth_type="FACE",
        path_mode="COPY", embed_textures=True, axis_forward="-Z", axis_up="Y")


def main():
    os.makedirs(os.path.join(OUT, "models"), exist_ok=True)
    objs = lp.build()
    names = list(lp.PALETTE)
    mat = make_material(make_palette(names))
    for o in objs:
        bake_to_palette(o, names, mat)
    export_fbx(os.path.join(OUT, "LowPolyPack.fbx"), objs)
    for o in objs:
        loc = o.location.copy()
        o.location = (0, 0, 0)
        export_fbx(os.path.join(OUT, "models", o.name.replace(" ", "") + ".fbx"), [o])
        o.location = loc
    print(f"Roblox export: {len(objs)} models -> {OUT}")


main()
