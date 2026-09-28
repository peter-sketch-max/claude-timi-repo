"""
Low Poly Pack - 40 stylised low-poly models, generated with Blender Python.

How to use
----------
1. Open Blender (4.x or 5.x).
2. Go to the "Scripting" tab, click "Open" and pick this file (or paste it in).
3. Press "Run Script".

Everything is built into a "LowPoly Pack" collection (one sub-collection per
category), laid out on a grid. Running the script again rebuilds that
collection and leaves the rest of your scene alone.

Every model is a single object with flat shading, its origin at the base, and
simple coloured materials, so you can drag them straight into a scene or export
them to a game engine.
"""

import math
import random
from contextlib import contextmanager

import bmesh
import bpy
from mathutils import Euler, Matrix, Vector

TAU = math.tau
PI = math.pi
COLLECTION_NAME = "LowPoly Pack"
COLUMNS = 8
SPACING = 4.5

# ---------------------------------------------------------------------------
# Palette: name -> (hex colour, roughness, emission strength, metallic)
# ---------------------------------------------------------------------------
PALETTE = {
    "green": ("#6ABE45", 0.8, 0, 0),
    "dark_green": ("#2F7D3B", 0.8, 0, 0),
    "leaf": ("#8BD35C", 0.8, 0, 0),
    "pine": ("#1F6E4A", 0.8, 0, 0),
    "brown": ("#7A4B2A", 0.9, 0, 0),
    "wood": ("#B9793E", 0.9, 0, 0),
    "wood_dark": ("#6B3F22", 0.9, 0, 0),
    "wood_light": ("#D9A066", 0.9, 0, 0),
    "red": ("#E23D3D", 0.7, 0, 0),
    "dark_red": ("#9E1F2B", 0.7, 0, 0),
    "pink": ("#FF8FB8", 0.7, 0, 0),
    "white": ("#F4F1EA", 0.8, 0, 0),
    "cream": ("#F3E3C3", 0.8, 0, 0),
    "yellow": ("#FFD23F", 0.7, 0, 0),
    "orange": ("#FF8C2B", 0.7, 0, 0),
    "gold": ("#F5B82E", 0.35, 0, 1),
    "silver": ("#C9D3DB", 0.3, 0, 1),
    "steel": ("#8E9BA6", 0.4, 0, 1),
    "stone": ("#9AA0A6", 0.95, 0, 0),
    "stone_dark": ("#6C737C", 0.95, 0, 0),
    "dark_gray": ("#3D4450", 0.7, 0, 0),
    "black": ("#22262E", 0.6, 0, 0),
    "blue": ("#2F7FE0", 0.6, 0, 0),
    "light_blue": ("#9ED8F5", 0.2, 0, 0),
    "water": ("#3BA7D9", 0.15, 0, 0),
    "purple": ("#8A4FD8", 0.3, 0.3, 0),
    "lavender": ("#C49BFF", 0.3, 0.3, 0),
    "cyan": ("#3FE0D0", 0.3, 0.4, 0),
    "sand": ("#E8C98E", 0.9, 0, 0),
    "terracotta": ("#C8643B", 0.9, 0, 0),
    "soil": ("#4E342E", 1.0, 0, 0),
    "waffle": ("#D99A4E", 0.9, 0, 0),
    "waffle_dark": ("#A86A2C", 0.9, 0, 0),
    "mint": ("#9FF0C8", 0.7, 0, 0),
    "yellow_glow": ("#FFE680", 0.5, 3.0, 0),
    "orange_glow": ("#FF7A1A", 0.5, 3.0, 0),
    "star": ("#FFD23F", 0.3, 1.0, 1),
    "potion": ("#E040FB", 0.1, 0.8, 0),
    "potion_green": ("#4CFF7A", 0.1, 0.8, 0),
    "glass": ("#DDF4FF", 0.05, 0, 0),
}


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_to_rgba(h):
    h = h.lstrip("#")
    return tuple(srgb_to_linear(int(h[i:i + 2], 16) / 255) for i in (0, 2, 4)) + (1.0,)


def get_material(name):
    full_name = "LP_" + name
    mat = bpy.data.materials.get(full_name)
    if mat:
        return mat
    hex_col, rough, emit, metal = PALETTE[name]
    rgba = hex_to_rgba(hex_col)
    mat = bpy.data.materials.new(full_name)
    if mat.node_tree is None:
        mat.use_nodes = True
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if emit:
        bsdf.inputs["Emission Color"].default_value = rgba
        bsdf.inputs["Emission Strength"].default_value = emit
    mat.diffuse_color = rgba  # colour shown in Solid viewport mode
    mat.roughness = rough
    return mat


def _vec3(s):
    return Vector(s) if hasattr(s, "__len__") else Vector((s, s, s))


# ---------------------------------------------------------------------------
# Tiny modelling toolkit: every model is built into one bmesh from primitives
# ---------------------------------------------------------------------------
class Model:
    def __init__(self, name):
        self.name = name
        self.bm = bmesh.new()
        self.colors = []
        self.stack = [Matrix.Identity(4)]
        self.rng = random.Random(sum(map(ord, name)))

    # -- transforms -------------------------------------------------------
    def _m(self, loc=(0, 0, 0), rot=(0, 0, 0), scale=1):
        return self.stack[-1] @ Matrix.LocRotScale(Vector(loc), Euler(rot), _vec3(scale))

    @contextmanager
    def at(self, loc=(0, 0, 0), rot=(0, 0, 0), scale=1):
        """Build everything inside this block relative to a new transform."""
        self.stack.append(self._m(loc, rot, scale))
        try:
            yield
        finally:
            self.stack.pop()

    # -- helpers ----------------------------------------------------------
    def _mat_index(self, color):
        if color not in self.colors:
            self.colors.append(color)
        return self.colors.index(color)

    def _tag(self, verts, color, jitter=0.0):
        faces = {f for v in verts for f in v.link_faces}
        idx = self._mat_index(color)
        for f in faces:
            f.material_index = idx
        if jitter:
            r = self.rng
            for v in verts:
                v.co += Vector((r.uniform(-1, 1), r.uniform(-1, 1), r.uniform(-1, 1))) * jitter
        return list(faces)

    def recolor(self, faces, color):
        idx = self._mat_index(color)
        for f in faces:
            f.material_index = idx

    # -- primitives -------------------------------------------------------
    def box(self, color, loc=(0, 0, 0), size=(1, 1, 1), rot=(0, 0, 0), jitter=0.0):
        res = bmesh.ops.create_cube(self.bm, size=1.0, matrix=self._m(loc, rot, size))
        return self._tag(res["verts"], color, jitter)

    def cyl(self, color, loc=(0, 0, 0), r=0.5, h=1.0, seg=8, r2=None, rot=(0, 0, 0),
            scale=1, jitter=0.0):
        """Cylinder / tapered cylinder centred on loc, axis along local Z."""
        res = bmesh.ops.create_cone(
            self.bm, cap_ends=True, cap_tris=False, segments=seg,
            radius1=r, radius2=r if r2 is None else r2, depth=h,
            matrix=self._m(loc, rot, scale))
        verts = res["verts"]
        if r2 == 0 or r == 0:
            bmesh.ops.remove_doubles(self.bm, verts=verts, dist=1e-5)
            verts = [v for v in verts if v.is_valid]
        return self._tag(verts, color, jitter)

    def cone(self, color, loc=(0, 0, 0), r=0.5, h=1.0, seg=8, rot=(0, 0, 0), scale=1, jitter=0.0):
        return self.cyl(color, loc, r, h, seg, r2=0, rot=rot, scale=scale, jitter=jitter)

    def ico(self, color, loc=(0, 0, 0), size=0.5, rot=(0, 0, 0), sub=1, jitter=0.0):
        res = bmesh.ops.create_icosphere(
            self.bm, subdivisions=sub, radius=1.0, matrix=self._m(loc, rot, size))
        return self._tag(res["verts"], color, jitter)

    def sphere(self, color, loc=(0, 0, 0), size=0.5, rot=(0, 0, 0), u=8, v=6, jitter=0.0):
        res = bmesh.ops.create_uvsphere(
            self.bm, u_segments=u, v_segments=v, radius=1.0, matrix=self._m(loc, rot, size))
        return self._tag(res["verts"], color, jitter)

    def poly(self, color, verts, faces, loc=(0, 0, 0), rot=(0, 0, 0), scale=1, jitter=0.0):
        mat = self._m(loc, rot, scale)
        vs = [self.bm.verts.new(mat @ Vector(v)) for v in verts]
        for f in faces:
            self.bm.faces.new([vs[i] for i in f])
        return self._tag(vs, color, jitter)

    def prism(self, color, points, depth=0.1, loc=(0, 0, 0), rot=(0, 0, 0), scale=1, jitter=0.0):
        """Extrude a 2D outline (in local XY) by depth along local Z."""
        n = len(points)
        d = depth / 2
        verts = [(x, y, -d) for x, y in points] + [(x, y, d) for x, y in points]
        faces = [list(range(n - 1, -1, -1)), list(range(n, 2 * n))]
        faces += [[i, (i + 1) % n, n + (i + 1) % n, n + i] for i in range(n)]
        return self.poly(color, verts, faces, loc, rot, scale, jitter)

    # -- finish -----------------------------------------------------------
    def build(self, collection):
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        mesh = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        for c in self.colors:
            mesh.materials.append(get_material(c))
        for p in mesh.polygons:
            p.use_smooth = False
        obj = bpy.data.objects.new(self.name, mesh)
        collection.objects.link(obj)
        return obj


def star_points(n=5, r_out=1.0, r_in=0.45, phase=PI / 2):
    pts = []
    for i in range(n * 2):
        a = phase + i * PI / n
        r = r_out if i % 2 == 0 else r_in
        pts.append((math.cos(a) * r, math.sin(a) * r))
    return pts


def grass_tuft(m, x, y, s=1.0):
    for i in range(3):
        a = i * TAU / 3 + 0.3
        m.cone("green", (x + math.cos(a) * 0.05 * s, y + math.sin(a) * 0.05 * s, 0.12 * s),
               r=0.05 * s, h=0.25 * s, seg=4, rot=(math.cos(a) * 0.35, math.sin(a) * 0.35, 0))


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
MODELS = []


def model(name, category):
    def deco(fn):
        MODELS.append((name, category, fn))
        return fn
    return deco


# ---- Nature ---------------------------------------------------------------
@model("Daisy", "Nature")
def daisy(m):
    m.cyl("green", (0, 0, 0.6), r=0.05, h=1.2, seg=6)
    m.ico("leaf", (0.2, 0, 0.4), size=(0.28, 0.09, 0.03), rot=(0, -0.5, 0))
    m.ico("leaf", (-0.18, 0, 0.65), size=(0.24, 0.08, 0.03), rot=(0, 0.5, 0))
    with m.at((0, 0, 1.2), rot=(0.35, 0, 0)):
        m.cyl("yellow", (0, 0, 0.02), r=0.16, h=0.1, seg=8)
        m.ico("yellow", (0, 0, 0.07), size=(0.12, 0.12, 0.06))
        for i in range(10):
            a = i * TAU / 10
            m.ico("white", (math.cos(a) * 0.32, math.sin(a) * 0.32, 0),
                  size=(0.2, 0.08, 0.025), rot=(0, 0, a))
    grass_tuft(m, 0.1, 0.1)


@model("Tulip", "Nature")
def tulip(m):
    m.cyl("green", (0, 0, 0.55), r=0.05, h=1.1, seg=6)
    m.ico("green", (0.12, 0, 0.4), size=(0.12, 0.04, 0.45), rot=(0, 0.35, 0))
    m.ico("green", (-0.1, 0.05, 0.35), size=(0.1, 0.04, 0.38), rot=(0, -0.3, 0.4))
    with m.at((0, 0, 1.1)):
        m.ico("dark_red", (0, 0, 0.15), size=(0.2, 0.2, 0.18))
        for i in range(6):
            a = i * TAU / 6
            m.ico("red" if i % 2 == 0 else "pink",
                  (math.cos(a) * 0.12, math.sin(a) * 0.12, 0.3),
                  size=(0.14, 0.07, 0.28), rot=(0, 0.2, a))


@model("Sunflower", "Nature")
def sunflower(m):
    m.cyl("green", (0, 0, 1.0), r=0.07, h=2.0, seg=6)
    m.ico("leaf", (0.3, 0, 0.8), size=(0.35, 0.14, 0.04), rot=(0, -0.4, 0))
    m.ico("leaf", (-0.28, 0.05, 1.3), size=(0.32, 0.13, 0.04), rot=(0, 0.4, 0.2))
    with m.at((0, 0, 2.0), rot=(1.1, 0, 0)):
        m.cyl("green", (0, 0, -0.08), r=0.3, h=0.1, seg=8)
        m.cyl("brown", (0, 0, 0), r=0.38, h=0.12, seg=10)
        m.ico("wood_dark", (0, 0, 0.06), size=(0.3, 0.3, 0.08))
        for i in range(14):
            a = i * TAU / 14
            m.ico("yellow", (math.cos(a) * 0.55, math.sin(a) * 0.55, 0),
                  size=(0.25, 0.09, 0.03), rot=(0, 0, a))
            b = a + PI / 14
            m.ico("orange", (math.cos(b) * 0.5, math.sin(b) * 0.5, -0.03),
                  size=(0.22, 0.08, 0.025), rot=(0, 0, b))


@model("Mushrooms", "Nature")
def mushrooms(m):
    def shroom():
        m.cyl("cream", (0, 0, 0.4), r=0.22, r2=0.18, h=0.8, seg=8)
        m.cyl("cream", (0, 0, 0.775), r=0.7, h=0.02, seg=10)
        m.cyl("red", (0, 0, 0.92), r=0.8, r2=0.55, h=0.28, seg=10)
        m.cyl("red", (0, 0, 1.16), r=0.55, r2=0.2, h=0.2, seg=10)
        for i in range(5):
            a = i * TAU / 5
            m.ico("white", (math.cos(a) * 0.68, math.sin(a) * 0.68, 0.93), size=(0.1, 0.1, 0.07))
        for i in range(3):
            a = i * TAU / 3 + 0.5
            m.ico("white", (math.cos(a) * 0.36, math.sin(a) * 0.36, 1.17), size=(0.08, 0.08, 0.06))
    with m.at((-0.3, 0, 0)):
        shroom()
    with m.at((0.75, 0.4, 0), rot=(0, 0, 1), scale=0.55):
        shroom()
    grass_tuft(m, 0.4, -0.5)


@model("Pine Tree", "Nature")
def pine_tree(m):
    m.cyl("brown", (0, 0, 0.3), r=0.15, h=0.6, seg=6)
    m.cone("pine", (0, 0, 1.1), r=1.0, h=1.2, seg=7, jitter=0.03)
    m.cone("pine", (0, 0, 1.7), r=0.8, h=1.0, seg=7, rot=(0, 0, 0.4), jitter=0.03)
    m.cone("dark_green", (0, 0, 2.3), r=0.55, h=0.9, seg=7, rot=(0, 0, 0.8), jitter=0.03)


@model("Round Tree", "Nature")
def round_tree(m):
    m.cyl("brown", (0, 0, 0.6), r=0.18, r2=0.12, h=1.2, seg=6)
    m.cyl("brown", (0.25, 0, 1.1), r=0.06, r2=0.04, h=0.5, seg=5, rot=(0, 0.8, 0))
    m.ico("green", (0, 0, 1.7), size=0.8, jitter=0.06)
    m.ico("leaf", (0.45, 0.2, 1.45), size=0.55, jitter=0.05)
    m.ico("dark_green", (-0.4, -0.25, 1.5), size=0.55, jitter=0.05)
    m.ico("leaf", (0, 0.1, 2.2), size=0.5, jitter=0.05)
    for p in [(0.3, -0.6, 1.6), (-0.5, 0.35, 1.9), (0.55, 0.3, 2.0), (-0.15, -0.7, 1.3)]:
        m.ico("red", p, size=0.08, sub=1)


@model("Palm Tree", "Nature")
def palm_tree(m):
    top = Vector((0, 0, 0))
    for i in range(6):
        x = 0.04 * i ** 1.5
        z = 0.22 + 0.42 * i
        m.cyl("wood" if i % 2 == 0 else "wood_light", (x, 0, z),
              r=0.17 - 0.012 * i, r2=0.15 - 0.012 * i, h=0.45, seg=6, rot=(0, 0.06 * i, 0))
        top = Vector((x + 0.05, 0, z + 0.2))
    with m.at(top):
        for k in range(7):
            a = k * TAU / 7
            m.ico("green" if k % 2 else "dark_green",
                  (math.cos(a) * 0.6, math.sin(a) * 0.6, -0.15),
                  size=(0.8, 0.2, 0.04), rot=(0, 0.35, a))
        for k in range(3):
            a = k * TAU / 3 + 0.5
            m.sphere("brown", (math.cos(a) * 0.15, math.sin(a) * 0.15, -0.2), size=0.12, u=6, v=4)
    m.ico("sand", (0, 0, 0), size=(0.6, 0.6, 0.12))


@model("Cactus", "Nature")
def cactus(m):
    m.cyl("terracotta", (0, 0, 0.25), r=0.45, r2=0.55, h=0.5, seg=8)
    m.cyl("terracotta", (0, 0, 0.53), r=0.6, h=0.1, seg=8)
    m.cyl("soil", (0, 0, 0.585), r=0.5, h=0.02, seg=8)
    with m.at((0, 0, 0.55)):
        m.cyl("green", (0, 0, 0.9), r=0.3, h=1.8, seg=8)
        m.cyl("green", (0, 0, 1.875), r=0.3, r2=0.15, h=0.15, seg=8)
        m.ico("pink", (0, 0, 1.97), size=(0.12, 0.12, 0.08))
        # right arm
        m.cyl("green", (0.42, 0, 0.8), r=0.16, h=0.4, seg=6, rot=(0, PI / 2, 0))
        m.cyl("green", (0.62, 0, 1.08), r=0.16, h=0.6, seg=6)
        m.cyl("green", (0.62, 0, 1.43), r=0.16, r2=0.08, h=0.1, seg=6)
        # left arm
        m.cyl("green", (-0.42, 0, 1.1), r=0.14, h=0.4, seg=6, rot=(0, PI / 2, 0))
        m.cyl("green", (-0.6, 0, 1.33), r=0.14, h=0.5, seg=6)
        m.cyl("green", (-0.6, 0, 1.62), r=0.14, r2=0.07, h=0.08, seg=6)


@model("Bush", "Nature")
def bush(m):
    parts = [((0, 0, 0.45), 0.55, "green"), ((0.45, 0.1, 0.35), 0.4, "leaf"),
             ((-0.4, 0.15, 0.35), 0.42, "dark_green"), ((0.1, -0.35, 0.3), 0.35, "leaf"),
             ((0.05, 0.2, 0.75), 0.38, "green")]
    for loc, s, col in parts:
        m.ico(col, loc, size=s, jitter=0.04)
    for i in range(7):
        a = i * TAU / 7
        e = 0.3 + 0.25 * (i % 3)
        d = Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e)))
        m.ico("red", Vector((0, 0, 0.45)) + d * 0.56, size=0.07)


@model("Rocks", "Nature")
def rocks(m):
    m.ico("stone", (0, 0, 0.35), size=(0.7, 0.6, 0.45), jitter=0.08)
    m.ico("green", (0, 0, 0.72), size=(0.35, 0.3, 0.08), jitter=0.02)
    m.ico("stone_dark", (0.75, 0.3, 0.25), size=(0.45, 0.4, 0.35), jitter=0.06)
    m.ico("stone", (-0.6, -0.4, 0.2), size=(0.35, 0.3, 0.3), jitter=0.05)
    m.ico("stone_dark", (0.3, -0.65, 0.08), size=(0.15, 0.12, 0.1), jitter=0.02)
    m.ico("stone", (-0.2, 0.6, 0.07), size=(0.12, 0.1, 0.08), jitter=0.02)


@model("Crystals", "Nature")
def crystals(m):
    m.ico("stone_dark", (0, 0, 0.15), size=(0.75, 0.65, 0.28), jitter=0.05)
    data = [(0, 0, 0, 0, 1.4, 0.2, "purple"), (0.3, 0.1, 0.1, 0.45, 0.9, 0.14, "lavender"),
            (-0.3, 0.15, -0.2, -0.45, 1.0, 0.15, "cyan"), (0.05, -0.3, -0.5, 0.1, 0.8, 0.13, "lavender"),
            (-0.1, 0.35, 0.5, -0.1, 0.7, 0.12, "purple"), (0.4, -0.2, -0.3, 0.6, 0.55, 0.1, "cyan")]
    for x, y, tx, ty, h, r, col in data:
        with m.at((x, y, 0.2), rot=(tx, ty, 0)):
            m.cyl(col, (0, 0, h / 2), r=r, h=h, seg=6)
            m.cone(col, (0, 0, h + r * 0.9), r=r, h=r * 1.8, seg=6)


@model("Cloud", "Nature")
def cloud(m):
    blobs = [((0, 0, 1.5), 0.6), ((0.55, 0, 1.4), 0.45), ((-0.55, 0.05, 1.4), 0.45),
             ((0.25, 0.1, 1.85), 0.42), ((-0.25, -0.05, 1.8), 0.38), ((0.95, 0, 1.3), 0.3),
             ((-0.95, 0, 1.3), 0.28)]
    for loc, s in blobs:
        m.ico("white", loc, size=(s, s * 0.9, s * 0.8), jitter=0.03)
    m.ico("light_blue", (0, 0, 1.18), size=(1.1, 0.5, 0.15))


# ---- Places ---------------------------------------------------------------
@model("House", "Places")
def house(m):
    m.box("cream", (0, 0, 0.55), (1.6, 1.4, 1.1))
    m.prism("red", [(-1.0, 0), (1.0, 0), (0, 0.75)], depth=1.6, loc=(0, 0, 1.1), rot=(PI / 2, 0, 0))
    m.box("stone", (0.45, 0.3, 1.5), (0.22, 0.22, 0.7))
    m.box("wood_dark", (0, -0.71, 0.32), (0.36, 0.06, 0.62))
    m.ico("gold", (0.1, -0.75, 0.3), size=0.03)
    for x in (-0.5, 0.5):
        m.box("white", (x, -0.71, 0.62), (0.38, 0.05, 0.38))
        m.box("light_blue", (x, -0.73, 0.62), (0.3, 0.05, 0.3))
    for y in (-0.3, 0.3):
        m.box("white", (0.81, y, 0.62), (0.05, 0.36, 0.36))
        m.box("light_blue", (0.83, y, 0.62), (0.05, 0.28, 0.28))
    m.box("stone", (0, -0.85, 0.04), (0.55, 0.25, 0.08))
    m.box("wood", (0, 0, 0.04), (1.7, 1.5, 0.08))


@model("Windmill", "Places")
def windmill(m):
    m.cyl("cream", (0, 0, 1.1), r=0.65, r2=0.42, h=2.2, seg=8)
    m.cone("red", (0, 0, 2.525), r=0.52, h=0.65, seg=8)
    m.box("wood_dark", (0, -0.62, 0.3), (0.3, 0.1, 0.55))
    m.box("light_blue", (0, -0.52, 1.3), (0.2, 0.1, 0.25))
    m.cyl("wood_dark", (0, -0.55, 1.95), r=0.1, h=0.25, seg=6, rot=(PI / 2, 0, 0))
    for k in range(4):
        a = k * PI / 2 + 0.3
        with m.at((0, -0.65, 1.95), rot=(0, a, 0)):
            m.box("wood", (0, 0, 0.7), (0.08, 0.05, 1.3))
            m.box("white", (0.2, 0, 0.8), (0.34, 0.03, 0.95))


@model("Lighthouse", "Places")
def lighthouse(m):
    m.ico("stone_dark", (0, 0, 0.1), size=(1.0, 1.0, 0.35), jitter=0.06)
    def radius(z):
        return 0.55 - (z - 0.3) * 0.08
    for i in range(4):
        z0 = 0.3 + i * 0.55
        m.cyl("red" if i % 2 == 0 else "white", (0, 0, z0 + 0.275),
              r=radius(z0), r2=radius(z0 + 0.55), h=0.55, seg=8)
    m.cyl("dark_gray", (0, 0, 2.54), r=0.55, h=0.08, seg=8)
    m.cyl("yellow_glow", (0, 0, 2.8), r=0.28, h=0.45, seg=8)
    for i in range(4):
        a = i * TAU / 4 + PI / 8
        m.box("dark_gray", (math.cos(a) * 0.28, math.sin(a) * 0.28, 2.8), (0.05, 0.05, 0.45))
    m.cone("red", (0, 0, 3.25), r=0.38, h=0.45, seg=8)
    m.ico("dark_gray", (0, 0, 3.5), size=0.06)
    m.box("wood_dark", (0, -0.52, 0.55), (0.25, 0.1, 0.45))


@model("Well", "Places")
def well(m):
    for i in range(10):
        a = i * TAU / 10
        m.box("stone" if i % 2 else "stone_dark", (math.cos(a) * 0.6, math.sin(a) * 0.6, 0.28),
              (0.38, 0.28, 0.55), rot=(0, 0, a + PI / 2), jitter=0.03)
    m.cyl("water", (0, 0, 0.45), r=0.5, h=0.05, seg=10)
    for x in (-0.6, 0.6):
        m.box("wood", (x, 0, 0.95), (0.12, 0.12, 1.3))
    m.cyl("wood_dark", (0, 0, 1.35), r=0.05, h=1.3, seg=6, rot=(0, PI / 2, 0))
    m.cyl("sand", (0, 0, 1.05), r=0.015, h=0.6, seg=4)
    m.cyl("wood", (0, 0, 0.72), r=0.1, r2=0.12, h=0.15, seg=8)
    m.prism("red", [(-0.9, 0), (0.9, 0), (0, 0.55)], depth=0.8, loc=(0, 0, 1.6), rot=(PI / 2, 0, 0))


@model("Fence", "Places")
def fence(m):
    for i in range(5):
        x = -1.2 + i * 0.6
        m.box("wood", (x, 0, 0.45), (0.14, 0.1, 0.9))
        m.cone("wood", (x, 0, 0.975), r=0.1, h=0.15, seg=4, rot=(0, 0, PI / 4))
    for z in (0.3, 0.65):
        m.box("wood_dark", (0, -0.07, z), (2.6, 0.05, 0.1))
    for x in (-0.9, 0.3, 1.1):
        grass_tuft(m, x, -0.15)


@model("Tent", "Places")
def tent(m):
    m.prism("orange", [(-0.9, 0), (0.9, 0), (0, 1.2)], depth=1.8, rot=(PI / 2, 0, 0))
    m.prism("dark_red", [(-0.35, 0), (0.35, 0), (0, 0.8)], depth=0.02, loc=(0, -0.91, 0),
            rot=(PI / 2, 0, 0))
    for y in (-0.9, 0.9):
        m.cyl("wood", (0, y, 1.25), r=0.03, h=0.2, seg=4)
    for x, y in [(-1.1, -0.9), (1.1, -0.9), (-1.1, 0.9), (1.1, 0.9)]:
        m.box("wood_dark", (x, y, 0.05), (0.05, 0.05, 0.12))


@model("Campfire", "Places")
def campfire(m):
    for i in range(8):
        a = i * TAU / 8
        m.ico("stone" if i % 2 else "stone_dark", (math.cos(a) * 0.55, math.sin(a) * 0.55, 0.08),
              size=(0.18, 0.15, 0.12), rot=(0, 0, a), jitter=0.02)
    for i in range(4):
        with m.at(rot=(0, 0, i * TAU / 4 + 0.4)):
            m.cyl("wood_dark", (0.18, 0, 0.3), r=0.08, h=0.8, seg=6, rot=(0, -0.6, 0))
    m.cone("orange_glow", (0, 0, 0.45), r=0.22, h=0.75, seg=5)
    m.cone("yellow_glow", (0.12, 0.08, 0.3), r=0.12, h=0.45, seg=5)
    m.cone("yellow_glow", (-0.1, -0.1, 0.28), r=0.1, h=0.4, seg=5)
    m.cone("orange_glow", (0.05, -0.12, 0.25), r=0.1, h=0.35, seg=5)


@model("Lamp Post", "Places")
def lamp_post(m):
    m.cyl("dark_gray", (0, 0, 0.1), r=0.25, r2=0.18, h=0.2, seg=8)
    m.cyl("dark_gray", (0, 0, 1.35), r=0.06, h=2.3, seg=6)
    m.box("dark_gray", (0, 0, 2.5), (0.3, 0.3, 0.05))
    m.box("yellow_glow", (0, 0, 2.7), (0.26, 0.26, 0.35))
    for x, y in [(-0.13, -0.13), (0.13, -0.13), (-0.13, 0.13), (0.13, 0.13)]:
        m.box("dark_gray", (x, y, 2.7), (0.04, 0.04, 0.36))
    m.cone("dark_gray", (0, 0, 3.0), r=0.24, h=0.25, seg=4, rot=(0, 0, PI / 4))
    m.ico("dark_gray", (0, 0, 3.15), size=0.05)


@model("Signpost", "Places")
def signpost(m):
    m.box("wood", (0, 0, 0.9), (0.15, 0.15, 1.8))
    m.cone("wood", (0, 0, 1.87), r=0.11, h=0.14, seg=4, rot=(0, 0, PI / 4))
    arrow = [(-0.6, -0.12), (0.45, -0.12), (0.6, 0), (0.45, 0.12), (-0.6, 0.12)]
    m.prism("wood_light", arrow, depth=0.06, loc=(0.3, -0.1, 1.55), rot=(PI / 2, 0, 0))
    m.prism("sand", arrow, depth=0.06, loc=(-0.3, -0.1, 1.2), rot=(PI / 2, 0, PI))
    with m.at((0, 0, 0.85), rot=(0, 0, 1.2)):
        m.prism("wood_light", arrow, depth=0.06, loc=(0.3, -0.1, 0), rot=(PI / 2, 0, 0))
    grass_tuft(m, 0.2, -0.15)
    grass_tuft(m, -0.2, 0.1, 0.8)


@model("Bench", "Places")
def bench(m):
    for y in (-0.2, 0, 0.2):
        m.box("wood", (0, y, 0.5), (1.8, 0.18, 0.06))
    m.box("wood", (0, 0.33, 0.82), (1.8, 0.16, 0.06), rot=(-1.35, 0, 0))
    m.box("wood", (0, 0.36, 1.05), (1.8, 0.16, 0.06), rot=(-1.35, 0, 0))
    for x in (-0.8, 0.8):
        for y in (-0.2, 0.2):
            m.box("dark_gray", (x, y, 0.24), (0.08, 0.08, 0.48))
        m.box("dark_gray", (x, 0.34, 0.85), (0.08, 0.06, 0.75), rot=(-0.2, 0, 0))
        m.box("dark_gray", (x * 1.06, 0, 0.72), (0.08, 0.55, 0.06))


# ---- Loot & Props ---------------------------------------------------------
@model("Treasure Chest", "Loot")
def treasure_chest(m):
    m.box("wood", (0, 0, 0.3), (1.2, 0.8, 0.6))
    m.cyl("wood", (0, 0, 0.6), r=0.4, h=1.17, seg=8, rot=(0, PI / 2, 0))
    for x in (-0.4, 0.4):
        m.box("gold", (x, 0, 0.3), (0.1, 0.84, 0.62))
        m.cyl("gold", (x, 0, 0.6), r=0.42, h=0.1, seg=8, rot=(0, PI / 2, 0))
    m.box("gold", (0, -0.42, 0.55), (0.18, 0.06, 0.22))
    m.box("black", (0, -0.455, 0.53), (0.04, 0.02, 0.08))
    for x, y, t in [(0.3, -0.7, 0.2), (-0.1, -0.8, 0.9), (0.55, -0.9, 1.5)]:
        m.cyl("gold", (x, y, 0.02), r=0.1, h=0.04, seg=8, rot=(0, 0, t))


@model("Barrel", "Loot")
def barrel(m):
    m.cyl("wood", (0, 0, 0.25), r=0.42, r2=0.5, h=0.5, seg=10)
    m.cyl("wood", (0, 0, 0.75), r=0.5, r2=0.42, h=0.5, seg=10)
    m.cyl("wood_dark", (0, 0, 1.005), r=0.4, h=0.02, seg=10)
    for z, r in [(0.12, 0.45), (0.88, 0.45), (0.36, 0.49), (0.64, 0.49)]:
        m.cyl("dark_gray", (0, 0, z), r=r, h=0.06, seg=10)


@model("Crate", "Loot")
def crate(m):
    m.box("wood_light", (0, 0, 0.5), (0.97, 0.97, 0.97))
    t = 0.12
    for x in (-0.47, 0.47):
        for y in (-0.47, 0.47):
            m.box("wood", (x, y, 0.5), (t + 0.015, t + 0.015, 1.03))
    for z in (0.06, 0.94):
        for s in (-0.47, 0.47):
            m.box("wood", (0, s, z), (1.02, t, t))
            m.box("wood", (s, 0, z), (t, 1.02, t))
    m.box("wood", (0, -0.5, 0.5), (0.1, 0.04, 1.2), rot=(0, PI / 4, 0))
    m.box("wood", (0.5, 0, 0.5), (0.04, 0.1, 1.2), rot=(PI / 4, 0, 0))


@model("Sword In Stone", "Loot")
def sword(m):
    m.ico("stone", (0, 0, 0.25), size=(0.8, 0.7, 0.45), jitter=0.06)
    blade = [(0, 0), (0.1, 0.15), (0.1, 1.4), (-0.1, 1.4), (-0.1, 0.15)]
    m.prism("silver", blade, depth=0.04, loc=(0, 0, 0.3), rot=(PI / 2, 0, 0))
    m.box("gold", (0, 0, 1.75), (0.6, 0.12, 0.1))
    m.ico("gold", (0.3, 0, 1.75), size=0.07)
    m.ico("gold", (-0.3, 0, 1.75), size=0.07)
    m.ico("red", (0, -0.07, 1.75), size=0.06)
    m.cyl("wood_dark", (0, 0, 2.0), r=0.05, h=0.4, seg=6)
    m.ico("gold", (0, 0, 2.25), size=0.09)
    for x, y in [(0.6, -0.4), (-0.55, -0.3), (0.2, 0.6)]:
        grass_tuft(m, x, y)


@model("Shield", "Loot")
def shield(m):
    with m.at(rot=(-0.15, 0, 0)):
        m.cyl("silver", (0, 0.03, 0.95), r=0.86, h=0.08, seg=10, rot=(PI / 2, 0, 0))
        m.cyl("blue", (0, 0, 0.95), r=0.8, h=0.12, seg=10, rot=(PI / 2, 0, 0))
        m.box("yellow", (0, -0.055, 0.95), (0.25, 0.04, 1.5))
        m.box("yellow", (0, -0.055, 0.95), (1.5, 0.04, 0.25))
        m.ico("silver", (0, -0.08, 0.95), size=(0.22, 0.12, 0.22))
    m.box("wood_dark", (0, 0.35, 0.4), (0.1, 0.1, 0.9), rot=(-0.5, 0, 0))


@model("Axe In Stump", "Loot")
def axe(m):
    m.cyl("wood_dark", (0, 0, 0.3), r=0.6, r2=0.5, h=0.6, seg=8)
    m.cyl("sand", (0, 0, 0.61), r=0.48, h=0.02, seg=8)
    m.cyl("wood", (0, 0, 0.622), r=0.3, h=0.01, seg=8)
    for i in range(4):
        with m.at(rot=(0, 0, i * TAU / 4 + 0.3)):
            m.cyl("wood_dark", (0.55, 0, 0.1), r=0.14, r2=0.05, h=0.4, seg=5, rot=(0, 1.85, 0))
    with m.at((0.05, 0, 0.55), rot=(0, 0.6, 0)):
        head = [(-0.1, 0.3), (-0.28, -0.05), (0, -0.12), (0.28, -0.05), (0.1, 0.3)]
        m.prism("steel", head, depth=0.08, rot=(PI / 2, 0, 0))
        m.cyl("wood", (0, 0, 0.9), r=0.05, h=1.3, seg=6)
    for x, y, t in [(0.8, -0.3, 0.3), (0.7, 0.4, 1.2), (-0.8, -0.2, 2.0)]:
        m.box("wood_light", (x, y, 0.02), (0.15, 0.06, 0.03), rot=(0, 0, t))


@model("Potions", "Loot")
def potions(m):
    with m.at((-0.25, 0, 0)):
        m.sphere("potion", (0, 0, 0.42), size=(0.45, 0.45, 0.42), u=8, v=6)
        m.cyl("glass", (0, 0, 0.95), r=0.12, h=0.3, seg=6)
        m.cyl("glass", (0, 0, 1.1), r=0.16, h=0.06, seg=6)
        m.cyl("wood", (0, 0, 1.18), r=0.1, r2=0.12, h=0.15, seg=6)
        m.ico("pink", (0.1, 0, 1.45), size=0.05)
        m.ico("pink", (-0.05, 0.05, 1.62), size=0.04)
    with m.at((0.55, 0.15, 0)):
        m.cyl("potion_green", (0, 0, 0.35), r=0.22, h=0.7, seg=6)
        m.cyl("potion_green", (0, 0, 0.75), r=0.22, r2=0.08, h=0.1, seg=6)
        m.cyl("glass", (0, 0, 0.88), r=0.07, h=0.16, seg=6)
        m.cyl("wood", (0, 0, 1.0), r=0.06, r2=0.08, h=0.1, seg=6)
        m.box("cream", (0, -0.2, 0.35), (0.25, 0.04, 0.2))


@model("Coins", "Loot")
def coins(m):
    m.cyl("gold", (0, 0, 0.6), r=0.6, h=0.14, seg=12, rot=(PI / 2, 0, 0))
    m.prism("star", star_points(5, 0.3, 0.13), depth=0.04, loc=(0, -0.08, 0.6), rot=(PI / 2, 0, 0))
    m.prism("star", star_points(5, 0.3, 0.13), depth=0.04, loc=(0, 0.08, 0.6), rot=(PI / 2, 0, 0))
    for i in range(5):
        m.cyl("gold", (0.9 + 0.02 * (i % 2), 0.3, 0.04 + 0.085 * i), r=0.3, h=0.08, seg=12,
              rot=(0, 0, i))
    m.cyl("gold", (0.8, -0.35, 0.04), r=0.3, h=0.08, seg=12)
    m.cyl("gold", (1.1, -0.3, 0.1), r=0.3, h=0.08, seg=12, rot=(0.3, 0, 0))


@model("Key", "Loot")
def key(m):
    cz = 1.25
    for i in range(8):
        a = i * TAU / 8
        m.box("gold", (math.cos(a) * 0.3, 0, cz + math.sin(a) * 0.3), (0.26, 0.1 + 0.01 * (i % 2), 0.1),
              rot=(0, -a - PI / 2, 0))
    m.ico("red", (0, 0, cz), size=0.1)
    m.box("gold", (0, 0, 0.55), (0.1, 0.09, 0.95))
    m.box("gold", (0.12, 0, 0.1), (0.2, 0.1, 0.08))
    m.box("gold", (0.1, 0, 0.26), (0.15, 0.1, 0.08))
    m.ico("gold", (0, 0, 0.05), size=0.07)


@model("Star", "Loot")
def star(m):
    pts = star_points(5, 0.9, 0.4)
    verts = [(0, -0.25, 0), (0, 0.25, 0)] + [(x, 0, y) for x, y in pts]
    n = len(pts)
    faces = []
    for i in range(n):
        a, b = 2 + i, 2 + (i + 1) % n
        faces.append([0, a, b])
        faces.append([1, b, a])
    m.poly("star", verts, faces, loc=(0, 0, 1.05))
    for x, z, s in [(0.9, 1.7, 0.06), (-0.85, 0.5, 0.05), (-0.7, 1.9, 0.04)]:
        m.ico("yellow_glow", (x, 0, z), size=s, sub=0 if s < 0.05 else 1)


# ---- Vehicles -------------------------------------------------------------
@model("Rocket", "Vehicles")
def rocket(m):
    with m.at((0, 0, 0.4)):
        m.cyl("white", (0, 0, 1.1), r=0.35, h=1.4, seg=8)
        m.cyl("white", (0, 0, 1.95), r=0.35, r2=0.25, h=0.3, seg=8)
        m.cone("red", (0, 0, 2.35), r=0.25, h=0.5, seg=8)
        m.cyl("red", (0, 0, 0.55), r=0.37, h=0.1, seg=8)
        m.cyl("silver", (0, -0.32, 1.4), r=0.18, h=0.08, seg=8, rot=(PI / 2, 0, 0))
        m.cyl("light_blue", (0, -0.34, 1.4), r=0.14, h=0.1, seg=8, rot=(PI / 2, 0, 0))
        fin = [(0.3, 0.4), (0.65, 0.0), (0.65, 0.35), (0.3, 0.95)]
        for i in range(3):
            m.prism("red", fin, depth=0.06, rot=(PI / 2, 0, i * TAU / 3 + PI / 2))
        m.cyl("dark_gray", (0, 0, 0.3), r=0.22, r2=0.28, h=0.2, seg=8)
        m.cone("orange_glow", (0, 0, 0.0), r=0.24, h=0.55, seg=6, rot=(PI, 0, 0))
        m.cone("yellow_glow", (0, 0, -0.12), r=0.13, h=0.7, seg=6, rot=(PI, 0, 0))


@model("Car", "Vehicles")
def car(m):
    m.box("red", (0, 0, 0.5), (2, 1, 0.45))
    cabin = [(-0.7, 0), (0.55, 0), (0.3, 0.45), (-0.55, 0.45)]
    m.prism("red", cabin, depth=0.9, loc=(-0.15, 0, 0.72), rot=(PI / 2, 0, 0))
    win = [(-0.6, 0.07), (0.45, 0.07), (0.25, 0.38), (-0.5, 0.38)]
    m.prism("light_blue", win, depth=0.92, loc=(-0.15, 0, 0.72), rot=(PI / 2, 0, 0))
    m.box("light_blue", (0.3, 0, 0.95), (0.03, 0.8, 0.45), rot=(0, -0.95, 0))
    for x in (-0.65, 0.65):
        for y in (-0.45, 0.45):
            m.cyl("black", (x, y, 0.25), r=0.25, h=0.2, seg=8, rot=(PI / 2, 0, 0))
            m.cyl("silver", (x, y, 0.25), r=0.12, h=0.22, seg=8, rot=(PI / 2, 0, 0))
    for y in (-0.3, 0.3):
        m.box("yellow_glow", (1.0, y, 0.58), (0.04, 0.2, 0.12))
        m.box("dark_red", (-1.0, y, 0.58), (0.04, 0.2, 0.12))
    for x in (-1.02, 1.02):
        m.box("dark_gray", (x, 0, 0.36), (0.1, 1.02, 0.12))


@model("Sailboat", "Vehicles")
def sailboat(m):
    m.cyl("water", (0, 0, 0.1), r=1.4, h=0.2, seg=10)
    outline = [(-0.9, -0.35), (0.6, -0.35), (1.1, 0), (0.6, 0.35), (-0.9, 0.35)]
    m.prism("wood", outline, depth=0.3, loc=(0, 0, 0.45))
    m.prism("wood_dark", outline, depth=0.25, loc=(0.05, 0, 0.2), scale=(0.8, 0.75, 1))
    m.prism("sand", outline, depth=0.02, loc=(0, 0, 0.61), scale=(0.92, 0.85, 1))
    m.prism("white", outline, depth=0.05, loc=(0, 0, 0.5), scale=(1.01, 1.01, 1))
    m.cyl("wood_dark", (0, 0, 1.6), r=0.04, h=2.0, seg=6)
    m.prism("white", [(0.05, 0.8), (0.9, 0.8), (0.05, 2.4)], depth=0.03, rot=(PI / 2, 0, 0))
    m.prism("cream", [(-0.05, 0.9), (-0.05, 2.2), (-0.7, 0.9)], depth=0.03, rot=(PI / 2, 0, 0))
    m.prism("red", [(0, 2.45), (-0.3, 2.52), (0, 2.6)], depth=0.02, rot=(PI / 2, 0, 0))


@model("Hot Air Balloon", "Vehicles")
def balloon(m):
    center = Vector((0, 0, 2.3))
    faces = m.sphere("red", center, size=(0.9, 0.9, 1.0), u=10, v=8)
    yellow = [f for f in faces
              if int(((math.atan2(*(f.calc_center_median() - center).yx) + TAU) % TAU)
                     / (TAU / 10) + 0.5) % 2]
    m.recolor(yellow, "yellow")
    m.cyl("red", (0, 0, 1.4), r=0.18, r2=0.55, h=0.45, seg=10)
    m.cyl("dark_gray", (0, 0, 1.16), r=0.18, h=0.05, seg=10)
    m.box("wood", (0, 0, 0.55), (0.5, 0.5, 0.4))
    m.box("wood_dark", (0, 0, 0.77), (0.55, 0.55, 0.06))
    for x, y in [(-0.2, -0.2), (0.2, -0.2), (-0.2, 0.2), (0.2, 0.2)]:
        m.cyl("sand", (x * 0.8, y * 0.8, 0.97), r=0.012, h=0.4, seg=4)


# ---- Fun & Food -----------------------------------------------------------
@model("Snowman", "Fun")
def snowman(m):
    m.ico("white", (0, 0, 0.55), size=0.6, sub=2)
    m.ico("white", (0, 0, 1.35), size=0.45, sub=2)
    m.ico("white", (0, 0, 1.95), size=0.32, sub=2)
    m.cyl("black", (0, 0, 2.22), r=0.35, h=0.05, seg=8)
    m.cyl("black", (0, 0, 2.45), r=0.22, h=0.4, seg=8)
    m.cyl("red", (0, 0, 2.3), r=0.23, h=0.08, seg=8)
    for x in (-0.11, 0.11):
        m.ico("black", (x, -0.28, 2.02), size=0.045)
    m.cone("orange", (0, -0.42, 1.95), r=0.06, h=0.3, seg=6, rot=(PI / 2, 0, 0))
    for y, z in [(-0.43, 1.5), (-0.45, 1.33), (-0.42, 1.16)]:
        m.ico("black", (0, y, z), size=0.05)
    m.cyl("red", (0, 0, 1.72), r=0.36, h=0.12, seg=10)
    m.box("red", (0.18, -0.33, 1.55), (0.12, 0.04, 0.35), rot=(0, 0.2, 0))
    for s in (-1, 1):
        m.cyl("wood_dark", (s * 0.7, 0, 1.45), r=0.03, h=0.8, seg=4, rot=(0, s * 1.1, 0))
        m.cyl("wood_dark", (s * 0.85, 0, 1.62), r=0.02, h=0.2, seg=4, rot=(0, s * 0.2, 0))


@model("Pumpkin", "Fun")
def pumpkin(m):
    m.ico("orange", (0, 0, 0.45), size=(0.5, 0.5, 0.42))
    for i in range(8):
        a = i * TAU / 8
        m.sphere("orange", (math.cos(a) * 0.32, math.sin(a) * 0.32, 0.45),
                 size=(0.32, 0.26, 0.44), rot=(0, 0, a), u=8, v=6)
    m.cyl("dark_green", (0, 0, 0.95), r=0.08, r2=0.05, h=0.3, seg=6, rot=(0.2, 0, 0))
    m.ico("leaf", (0.25, 0.1, 0.9), size=(0.25, 0.15, 0.03), rot=(0, 0.3, 0.4))


@model("Apples", "Fun")
def apples(m):
    def apple(color):
        m.sphere(color, (0, 0, 0.45), size=(0.5, 0.5, 0.45), u=8, v=6)
        m.cyl("brown", (0, 0, 0.95), r=0.03, h=0.25, seg=4, rot=(0.15, 0, 0))
        m.ico("green", (0.13, 0, 0.98), size=(0.2, 0.09, 0.02), rot=(0, -0.3, 0))
    apple("red")
    with m.at((0.75, 0.35, 0), rot=(0, 0, 1.5), scale=0.7):
        apple("leaf")


@model("Ice Cream", "Fun")
def ice_cream(m):
    m.cyl("waffle", (0, 0, 0.5), r=0.02, r2=0.35, h=1.0, seg=8)
    m.cyl("waffle_dark", (0, 0, 1.02), r=0.38, h=0.1, seg=8)
    m.ico("pink", (0, 0, 1.3), size=0.38, sub=2)
    m.ico("mint", (0, 0, 1.72), size=0.34, sub=2)
    m.sphere("red", (0.05, 0, 2.1), size=0.1, u=6, v=4)
    m.cyl("dark_green", (0.08, 0, 2.25), r=0.012, h=0.2, seg=4, rot=(0, 0.3, 0))
    colors = ["yellow", "blue", "white", "orange", "purple"]
    r = m.rng
    for k in range(12):
        a = r.uniform(0, TAU)
        e = r.uniform(0.2, 1.2)
        d = Vector((math.cos(a) * math.cos(e), math.sin(a) * math.cos(e), math.sin(e)))
        m.box(colors[k % len(colors)], Vector((0, 0, 1.72)) + d * 0.33, (0.09, 0.025, 0.025),
              rot=(r.uniform(0, PI), r.uniform(0, PI), r.uniform(0, PI)))


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
def remove_collection(name):
    col = bpy.data.collections.get(name)
    if not col:
        return
    for child in list(col.children_recursive):
        for obj in list(child.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(child)
    for obj in list(col.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.collections.remove(col)
    for mesh in [me for me in bpy.data.meshes if me.users == 0]:
        bpy.data.meshes.remove(mesh)


def build():
    remove_collection(COLLECTION_NAME)
    root = bpy.data.collections.new(COLLECTION_NAME)
    bpy.context.scene.collection.children.link(root)
    subs = {}
    objects = []
    for i, (name, category, fn) in enumerate(MODELS):
        if category not in subs:
            subs[category] = bpy.data.collections.new(f"{COLLECTION_NAME} - {category}")
            root.children.link(subs[category])
        m = Model(name)
        fn(m)
        obj = m.build(subs[category])
        row, col = divmod(i, COLUMNS)
        obj.location = ((col - (COLUMNS - 1) / 2) * SPACING, -row * SPACING, 0)
        objects.append(obj)
    print(f"LowPoly Pack: built {len(objects)} models")
    return objects


if __name__ == "__main__":
    build()
