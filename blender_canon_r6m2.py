"""
Canon R6 Mark II — 完整精致版
所有零件上色 + 无镜头盖 + 传感器可见 + 整体合一
Blender Scripting → Open → Run
"""

import bpy
import bmesh
import math
import os

# ═══════════════════════════════════════════
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for m in bpy.data.materials:
    bpy.data.materials.remove(m)

# ═══════════════════════════════════════════
# 材质
# ═══════════════════════════════════════════
def make_mat(name, color, metallic=0.0, roughness=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bs = mat.node_tree.nodes["Principled BSDF"]
    bs.inputs["Base Color"].default_value = color
    bs.inputs["Metallic"].default_value = metallic
    bs.inputs["Roughness"].default_value = roughness
    return mat

def assign(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

def noise_rough(mat, sc=8.0, base=0.5, var=0.12):
    n = mat.node_tree.nodes; l = mat.node_tree.links; bs = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); tc.location = (-700, 0)
    mp = n.new("ShaderNodeMapping"); mp.location = (-500, 0); mp.inputs["Scale"].default_value = (sc, sc, sc)
    ns = n.new("ShaderNodeTexNoise"); ns.location = (-300, 0); ns.inputs["Scale"].default_value = sc; ns.inputs["Detail"].default_value = 2.5; ns.inputs["Roughness"].default_value = 0.5
    cr = n.new("ShaderNodeValToRGB"); cr.location = (-100, 0); cr.color_ramp.elements[0].position = 0.25; cr.color_ramp.elements[1].position = 0.75
    ml = n.new("ShaderNodeMath"); ml.operation = 'MULTIPLY'; ml.location = (100, 0); ml.inputs[1].default_value = var
    ad = n.new("ShaderNodeMath"); ad.operation = 'ADD'; ad.location = (300, 0); ad.inputs[1].default_value = base
    l.new(tc.outputs["Object"], mp.inputs["Vector"]); l.new(mp.outputs["Vector"], ns.inputs["Vector"])
    l.new(ns.outputs["Fac"], cr.inputs["Fac"]); l.new(cr.outputs["Color"], ml.inputs[0])
    l.new(ml.outputs["Value"], ad.inputs[0]); l.new(ad.outputs["Value"], bs.inputs["Roughness"])

def add_aniso(mat, strength=0.3, angle=0.15):
    """给金属加各向异性高光，模拟拉丝金属质感"""
    bs = mat.node_tree.nodes["Principled BSDF"]
    bs.inputs["Anisotropic"].default_value = strength
    bs.inputs["Anisotropic Rotation"].default_value = angle

def leather(mat, sc=22.0, strength=0.4):
    n = mat.node_tree.nodes; l = mat.node_tree.links; bs = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); tc.location = (-900, -400)
    mp = n.new("ShaderNodeMapping"); mp.location = (-700, -400); mp.inputs["Scale"].default_value = (sc, sc, sc)
    n1 = n.new("ShaderNodeTexNoise"); n1.location = (-500, -300); n1.inputs["Scale"].default_value = sc; n1.inputs["Detail"].default_value = 6.0; n1.inputs["Roughness"].default_value = 0.3
    n2 = n.new("ShaderNodeTexVoronoi"); n2.location = (-500, -550); n2.inputs["Scale"].default_value = sc * 2.5; n2.feature = 'DISTANCE'
    mx = n.new("ShaderNodeMix"); mx.data_type = 'FLOAT'; mx.location = (-300, -400); mx.inputs["Factor"].default_value = 0.55
    bp = n.new("ShaderNodeBump"); bp.location = (-100, -400); bp.inputs["Strength"].default_value = strength; bp.inputs["Distance"].default_value = 0.015
    l.new(tc.outputs["Object"], mp.inputs["Vector"]); l.new(mp.outputs["Vector"], n1.inputs["Vector"])
    l.new(mp.outputs["Vector"], n2.inputs["Vector"]); l.new(n1.outputs["Fac"], mx.inputs[4])
    l.new(n2.outputs["Distance"], mx.inputs[5]); l.new(mx.outputs["Result"], bp.inputs["Height"])
    l.new(bp.outputs["Normal"], bs.inputs["Normal"])

def body_color(mat):
    n = mat.node_tree.nodes; l = mat.node_tree.links; bs = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); tc.location = (-700, 300)
    ns = n.new("ShaderNodeTexNoise"); ns.location = (-500, 300); ns.inputs["Scale"].default_value = 4.0; ns.inputs["Detail"].default_value = 2.0
    cr = n.new("ShaderNodeValToRGB"); cr.location = (-300, 300)
    cr.color_ramp.elements[0].color = (0.018, 0.016, 0.015, 1); cr.color_ramp.elements[0].position = 0.3
    cr.color_ramp.elements[1].color = (0.035, 0.030, 0.026, 1); cr.color_ramp.elements[1].position = 0.7
    l.new(tc.outputs["Object"], ns.inputs["Vector"]); l.new(ns.outputs["Fac"], cr.inputs["Fac"])
    l.new(cr.outputs["Color"], bs.inputs["Base Color"])

def metal_wear(mat, sc=22.0):
    n = mat.node_tree.nodes; l = mat.node_tree.links; bs = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); tc.location = (-700, -200)
    ns = n.new("ShaderNodeTexNoise"); ns.location = (-500, -200); ns.inputs["Scale"].default_value = sc; ns.inputs["Detail"].default_value = 8.0; ns.inputs["Roughness"].default_value = 0.15
    cr = n.new("ShaderNodeValToRGB"); cr.location = (-300, -200)
    cr.color_ramp.elements[0].position = 0.0; cr.color_ramp.elements[0].color = (0.1, 0.1, 0.1, 1)
    cr.color_ramp.elements[1].position = 0.1; cr.color_ramp.elements[1].color = (0.7, 0.7, 0.7, 1)
    base = bs.inputs["Base Color"].default_value[:]
    mx = n.new("ShaderNodeMix"); mx.data_type = 'RGBA'; mx.location = (-100, -100)
    mx.inputs[6].default_value = base; mx.inputs[7].default_value = (0.72, 0.72, 0.72, 1)
    l.new(tc.outputs["Object"], ns.inputs["Vector"]); l.new(ns.outputs["Fac"], cr.inputs["Fac"])
    l.new(cr.outputs["Color"], mx.inputs["Factor"]); l.new(mx.outputs["Result"], bs.inputs["Base Color"])

def screen_glow(mat):
    bs = mat.node_tree.nodes["Principled BSDF"]
    bs.inputs["Emission Color"].default_value = (0.012, 0.030, 0.045, 1)
    bs.inputs["Emission Strength"].default_value = 0.8

def sensor_iridescence(mat):
    """给传感器加微弱彩虹反射效果"""
    n = mat.node_tree.nodes; l = mat.node_tree.links; bs = n["Principled BSDF"]
    bs.inputs["Coat Weight"].default_value = 1.0
    bs.inputs["Coat Roughness"].default_value = 0.05
    bs.inputs["Coat IOR"].default_value = 1.8
    tc = n.new("ShaderNodeTexCoord"); tc.location = (-600, 200)
    ns = n.new("ShaderNodeTexNoise"); ns.location = (-400, 200)
    ns.inputs["Scale"].default_value = 2.0; ns.inputs["Detail"].default_value = 1.5
    cr = n.new("ShaderNodeValToRGB"); cr.location = (-200, 200)
    cr.color_ramp.elements[0].color = (0.015, 0.005, 0.045, 1)
    cr.color_ramp.elements[0].position = 0.3
    cr.color_ramp.elements[1].color = (0.025, 0.015, 0.060, 1)
    cr.color_ramp.elements[1].position = 0.7
    l.new(tc.outputs["Object"], ns.inputs["Vector"]); l.new(ns.outputs["Fac"], cr.inputs["Fac"])
    l.new(cr.outputs["Color"], bs.inputs["Base Color"])

# ─── 材质表 ───
# 机身 — 深黑带暖色调微妙变化
mat_body = make_mat("Body_Black", (0.024, 0.020, 0.018, 1), 0.05, 0.52)
body_color(mat_body); noise_rough(mat_body, 5.0, 0.48, 0.10)

# 手柄 — 温暖深棕皮革
mat_grip = make_mat("Grip_Leather", (0.014, 0.010, 0.008, 1), 0.0, 0.90)
leather(mat_grip, 22.0, 0.45); noise_rough(mat_grip, 12.0, 0.85, 0.08)

# 银色金属 — 冷调亮银，各向异性
mat_metal = make_mat("Metal_Silver", (0.68, 0.68, 0.70, 1), 1.0, 0.18)
metal_wear(mat_metal, 28.0); add_aniso(mat_metal, 0.35, 0.12)

# 深色金属 — 枪灰色
mat_metal_dark = make_mat("Metal_Dark", (0.08, 0.08, 0.09, 1), 0.95, 0.24)
metal_wear(mat_metal_dark, 20.0); noise_rough(mat_metal_dark, 14.0, 0.22, 0.06)
add_aniso(mat_metal_dark, 0.2, 0.08)

# LCD 屏幕 — 深蓝绿微发光（真实 LCD 色调）
mat_screen = make_mat("LCD_Screen", (0.005, 0.012, 0.020, 1), 0.0, 0.05)
screen_glow(mat_screen)

# 佳能红 — 高饱和标志性红
mat_red = make_mat("Canon_Red", (0.82, 0.012, 0.012, 1), 0.30, 0.28)
noise_rough(mat_red, 4.0, 0.26, 0.04)

# 传感器 — 深紫蓝玻璃，带彩虹反射
mat_sensor = make_mat("Sensor_Glass", (0.015, 0.008, 0.050, 1), 0.0, 0.02)
sensor_iridescence(mat_sensor)

# 橡胶 — 深灰偏蓝黑，不是纯黑
mat_rubber = make_mat("Rubber", (0.008, 0.008, 0.012, 1), 0.0, 0.93)
noise_rough(mat_rubber, 10.0, 0.90, 0.06)

# 白色文字
mat_white = make_mat("White_Text", (0.92, 0.92, 0.92, 1), 0.0, 0.38)

# 存储卡/电池仓 — 暗灰金属
mat_slot = make_mat("Slot_Dark", (0.045, 0.045, 0.050, 1), 0.7, 0.36)

# 肩带环 — 亮银
mat_strap = make_mat("Strap_Ring", (0.62, 0.62, 0.64, 1), 1.0, 0.14)
metal_wear(mat_strap, 32.0); add_aniso(mat_strap, 0.25, 0.1)

# 金色触点 — 温暖饱满的金色
mat_gold = make_mat("Gold_Contact", (0.88, 0.68, 0.10, 1), 1.0, 0.12)
metal_wear(mat_gold, 35.0)

# 镜头内壁 — 哑光深灰
mat_lens_inner = make_mat("Lens_Inner", (0.010, 0.010, 0.014, 1), 0.3, 0.42)
noise_rough(mat_lens_inner, 6.0, 0.40, 0.08)

# 镜头玻璃 — 深紫蓝反射
mat_lens_glass = make_mat("Lens_Glass", (0.025, 0.020, 0.055, 1), 0.0, 0.03)

# 热靴金属 — 偏冷亮银
mat_hotshoe = make_mat("HotShoe_Metal", (0.60, 0.62, 0.66, 1), 1.0, 0.16)
metal_wear(mat_hotshoe, 24.0); add_aniso(mat_hotshoe, 0.4, 0.15)

# ═══════════════════════════════════════════
# 工具
# ═══════════════════════════════════════════
W, H, D = 0.139, 0.088, 0.086

def cube(name, loc, sc, mat=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object; o.name = name; o.scale = sc
    bpy.ops.object.transform_apply(scale=True)
    if mat: assign(o, mat)
    return o

def cyl(name, loc, r, h, rot=(0,0,0), mat=None, v=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=v, location=loc)
    o = bpy.context.active_object; o.name = name; o.rotation_euler = rot
    if mat: assign(o, mat)
    return o

def sm(o): bpy.ops.object.shade_smooth()

def bevel(o, amt=0.002, seg=3):
    bpy.context.view_layer.objects.active = o
    m = o.modifiers.new("B", 'BEVEL'); m.width = amt; m.segments = seg
    bpy.ops.object.modifier_apply(modifier="B")

def subdiv(o, lv=2):
    bpy.context.view_layer.objects.active = o
    m = o.modifiers.new("S", 'SUBSURF'); m.levels = lv; m.render_levels = lv
    bpy.ops.object.modifier_apply(modifier="S")

def union(target, tool):
    bpy.context.view_layer.objects.active = target
    m = target.modifiers.new("U", 'BOOLEAN'); m.operation = 'UNION'; m.object = tool
    bpy.ops.object.modifier_apply(modifier="U")
    bpy.data.objects.remove(tool, do_unlink=True)

# ═══════════════════════════════════════════
# 机身壳体 — 布尔焊成一体
# ═══════════════════════════════════════════
body = cube("Body", (0, 0, 0), (W/2, D/2, H/2))
grip = cube("Grip", (W/2 - 0.010, -0.006, -0.006), (0.024, 0.026, 0.040))
bevel(grip, 0.006, 4)
evf = cube("EVF", (-0.008, -D/2 + 0.008, H/2 - 0.003), (0.028, 0.020, 0.016))
bevel(evf, 0.004, 3)
top = cube("Top", (0.01, -D/2 + 0.012, H/2 + 0.001), (0.045, 0.016, 0.006))
lsh = cube("LShoulder", (-W/2 + 0.025, -0.005, H/2 + 0.002), (0.025, 0.020, 0.008))
bevel(lsh, 0.003, 3)
rsh = cube("RShoulder", (W/2 - 0.020, -0.010, H/2 + 0.001), (0.022, 0.022, 0.007))
bevel(rsh, 0.003, 3)

union(body, grip); union(body, evf); union(body, top); union(body, lsh); union(body, rsh)
bevel(body, 0.004, 4); subdiv(body, 2); sm(body)
assign(body, mat_body)

# ═══════════════════════════════════════════
# 手柄皮革
# ═══════════════════════════════════════════
gp = cube("GripPatch", (W/2 - 0.008, -D/2 + 0.008, -0.005), (0.016, 0.003, 0.034))
bevel(gp, 0.003, 3); subdiv(gp, 1); sm(gp); assign(gp, mat_grip)

tg = cube("ThumbGrip", (0.042, D/2 - 0.006, 0.005), (0.014, 0.003, 0.022))
bevel(tg, 0.003, 3); sm(tg); assign(tg, mat_grip)

# ═══════════════════════════════════════════
# 取景器
# ═══════════════════════════════════════════
ep = cyl("Eyepiece", (-0.008, -D/2 - 0.004, H/2 - 0.004), 0.013, 0.010,
         rot=(math.radians(90),0,0), mat=mat_rubber, v=32); sm(ep)
ep_glass = cyl("EPGlass", (-0.008, -D/2 - 0.008, H/2 - 0.004), 0.009, 0.004,
               rot=(math.radians(90),0,0), mat=mat_lens_glass, v=32); sm(ep_glass)

# ═══════════════════════════════════════════
# 热靴
# ═══════════════════════════════════════════
hs = cube("HotShoe", (-0.008, -0.008, H/2 + 0.004), (0.020, 0.014, 0.005))
bevel(hs, 0.001, 2); sm(hs); assign(hs, mat_hotshoe)

for s in [-1, 1]:
    r = cube(f"HSRail_{s}", (-0.008 + s*0.008, -0.008, H/2 + 0.007), (0.002, 0.012, 0.003))
    sm(r); assign(r, mat_hotshoe)

hp = cube("HSPin", (-0.008, -0.008, H/2 + 0.008), (0.004, 0.003, 0.001))
assign(hp, mat_gold)
for i, dx in enumerate([-0.004, -0.002, 0.002, 0.004]):
    p = cube(f"HSPin_{i}", (-0.008 + dx, -0.008, H/2 + 0.008), (0.001, 0.002, 0.001))
    assign(p, mat_gold)

# ═══════════════════════════════════════════
# 模式拨盘
# ═══════════════════════════════════════════
dl = cyl("ModeDial", (-W/2 + 0.028, -0.006, H/2 + 0.008), 0.016, 0.014, mat=mat_metal_dark, v=48)
bevel(dl, 0.002, 3); subdiv(dl, 1); sm(dl)

for i in range(48):
    a = math.radians(i * 7.5)
    x = -W/2 + 0.028 + math.cos(a) * 0.0155
    y = -0.006 + math.sin(a) * 0.0155
    k = cyl(f"Knurl_{i}", (x, y, H/2 + 0.008), 0.0006, 0.015, v=6)
    assign(k, mat_metal)

mk = cube("DialMark", (-W/2 + 0.028, -0.006 + 0.014, H/2 + 0.016), (0.001, 0.003, 0.001))
assign(mk, mat_white)

# ═══════════════════════════════════════════
# 快门 + 电源
# ═══════════════════════════════════════════
sb = cyl("ShutterBase", (W/2 - 0.014, -0.022, H/2 + 0.004), 0.009, 0.006, mat=mat_metal_dark, v=32); sm(sb)
st = cyl("Shutter", (W/2 - 0.014, -0.022, H/2 + 0.008), 0.007, 0.003, mat=mat_metal, v=32); sm(st)
sc = cyl("ShutterCave", (W/2 - 0.014, -0.022, H/2 + 0.010), 0.004, 0.001, mat=mat_metal_dark, v=32); sm(sc)

fd = cyl("FrontDial", (W/2 - 0.004, -0.028, H/2 - 0.003), 0.009, 0.005,
         rot=(math.radians(90),0,0), mat=mat_rubber, v=32); sm(fd)
for i in range(20):
    a = math.radians(i * 18)
    y = -0.028 + math.cos(a) * 0.008; z = H/2 - 0.003 + math.sin(a) * 0.008
    r = cube(f"FDR_{i}", (W/2 - 0.004, y, z), (0.005, 0.0005, 0.0005))
    assign(r, mat_metal_dark)

pw = cyl("PowerRing", (W/2 - 0.014, -0.022, H/2 + 0.003), 0.012, 0.002, mat=mat_metal_dark, v=32); sm(pw)

# ═══════════════════════════════════════════
# 镜头卡口 — 无镜头盖，传感器完全可见
# ═══════════════════════════════════════════
# 外法兰 — 银色金属
fl = cyl("MountFlange", (0.005, -D/2 + 0.004, -0.002), 0.035, 0.006,
         rot=(math.radians(90),0,0), mat=mat_metal, v=64); sm(fl)

# 卡口环 — 带倒角
mr = cyl("MountRing", (0.005, -D/2 + 0.007, -0.002), 0.037, 0.004,
         rot=(math.radians(90),0,0), mat=mat_metal_dark, v=64)
bevel(mr, 0.001, 2); sm(mr)

# 内筒 — 深黑色，层层递进
barrel1 = cyl("Barrel1", (0.005, -D/2 + 0.001, -0.002), 0.030, 0.014,
              rot=(math.radians(90),0,0), mat=mat_lens_inner, v=64); sm(barrel1)
barrel2 = cyl("Barrel2", (0.005, -D/2 + 0.006, -0.002), 0.026, 0.008,
              rot=(math.radians(90),0,0), mat=mat_body, v=64); sm(barrel2)
barrel3 = cyl("Barrel3", (0.005, -D/2 + 0.009, -0.002), 0.022, 0.006,
              rot=(math.radians(90),0,0), mat=mat_lens_inner, v=64); sm(barrel3)

# 遮光挡板（环形，中间留空露出传感器）
baffle = cyl("Baffle", (0.005, -D/2 + 0.012, -0.002), 0.020, 0.002,
             rot=(math.radians(90),0,0), mat=mat_body, v=64); sm(baffle)

# ★ 传感器 — 完全可见，深紫蓝玻璃质感
sensor = cyl("Sensor", (0.005, -D/2 + 0.013, -0.002), 0.017, 0.001,
             rot=(math.radians(90),0,0), mat=mat_sensor, v=48); sm(sensor)

# 传感器边框（金色细线）
sensor_frame = cyl("SensorFrame", (0.005, -D/2 + 0.013, -0.002), 0.018, 0.001,
                   rot=(math.radians(90),0,0), mat=mat_gold, v=48); sm(sensor_frame)

# 卡口定位红点
rd = cyl("MountRedDot", (0.005 + 0.032, -D/2 + 0.007, -0.002 + 0.018),
         0.002, 0.001, rot=(math.radians(90),0,0), mat=mat_red, v=16); sm(rd)

# 卡口触点 — 12 个金色引脚
for i in range(12):
    a = math.radians(-40 + i * 7)
    x = 0.005 + math.cos(a) * 0.031
    z = -0.002 + math.sin(a) * 0.031
    p = cube(f"Pin_{i}", (x, -D/2 + 0.006, z), (0.0015, 0.002, 0.003))
    p.rotation_euler = (0, 0, a); bpy.ops.object.transform_apply(rotation=True)
    assign(p, mat_gold)

# 卡口锁扣凸起
lock = cube("MountLock", (0.005 - 0.034, -D/2 + 0.006, -0.002), (0.003, 0.005, 0.006))
bevel(lock, 0.001, 2); sm(lock); assign(lock, mat_metal_dark)

# ═══════════════════════════════════════════
# 红色装饰条
# ═══════════════════════════════════════════
rs = cube("RedStripe", (0.040, -D/2 + 0.001, 0.016), (0.003, 0.002, 0.018))
bevel(rs, 0.001, 2); subdiv(rs, 1); sm(rs); assign(rs, mat_red)

# ═══════════════════════════════════════════
# LCD 屏幕
# ═══════════════════════════════════════════
lcd = cube("LCD", (-0.006, D/2 - 0.002, -0.006), (0.046, 0.002, 0.033))
bevel(lcd, 0.001, 2); sm(lcd); assign(lcd, mat_screen)
lb = cube("LCDFrame", (-0.006, D/2 - 0.001, -0.006), (0.049, 0.001, 0.036))
assign(lb, mat_body)

# ═══════════════════════════════════════════
# 背面按键
# ═══════════════════════════════════════════
for px, py, pz, r, nm in [
    (0.038, D/2-0.001, 0.022, 0.004, "Menu"),
    (0.052, D/2-0.001, 0.022, 0.004, "Info"),
    (0.052, D/2-0.001, 0.008, 0.004, "AFOn"),
    (0.062, D/2-0.001, 0.008, 0.003, "Star"),
]:
    b = cyl(f"Btn_{nm}", (px, py, pz), r, 0.002, rot=(math.radians(90),0,0), mat=mat_rubber, v=24); sm(b)

dp = cyl("DPad", (0.050, D/2-0.001, -0.018), 0.014, 0.002, rot=(math.radians(90),0,0), mat=mat_rubber, v=48); sm(dp)
for dx, dy, lb in [(0,0.010,"U"),(0,-0.010,"D"),(-0.010,0,"L"),(0.010,0,"R")]:
    d = cube(f"Dir_{lb}", (0.050+dx, D/2-0.001, -0.018+dy), (0.004, 0.002, 0.004))
    bevel(d, 0.001, 2); sm(d); assign(d, mat_rubber)

se = cyl("SETBtn", (0.050, D/2-0.001, -0.018), 0.004, 0.003, rot=(math.radians(90),0,0), mat=mat_metal_dark, v=24); sm(se)

# ═══════════════════════════════════════════
# 背面拨轮
# ═══════════════════════════════════════════
rd = cyl("RearDial", (0.058, D/2-0.003, 0.026), 0.007, 0.005, rot=(math.radians(90),0,0), mat=mat_metal_dark, v=32)
bevel(rd, 0.001, 2); sm(rd)
for i in range(16):
    a = math.radians(i * 22.5)
    y = D/2-0.003 + math.cos(a)*0.006; z = 0.026 + math.sin(a)*0.006
    r = cube(f"RR_{i}", (0.058, y, z), (0.005, 0.0004, 0.0004))
    assign(r, mat_metal)

# ═══════════════════════════════════════════
# 底部
# ═══════════════════════════════════════════
tr = cyl("Tripod", (0, 0, -H/2-0.001), 0.004, 0.003, mat=mat_metal, v=24); sm(tr)
bt = cube("Battery", (-0.018, 0, -H/2-0.001), (0.026, 0.020, 0.002))
bevel(bt, 0.001, 2); sm(bt); assign(bt, mat_slot)
bl = cube("BattLatch", (-0.018, 0.012, -H/2-0.002), (0.004, 0.003, 0.001))
assign(bl, mat_metal_dark)

# ═══════════════════════════════════════════
# 肩带环
# ═══════════════════════════════════════════
for s in [-1, 1]:
    x = s * (W/2 + 0.002)
    lg = cube(f"Lug_{s}", (x, 0, H/2-0.015), (0.004, 0.006, 0.006))
    bevel(lg, 0.001, 2); sm(lg); assign(lg, mat_body)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.005, minor_radius=0.0012, location=(x + s*0.003, 0, H/2-0.015))
    assign(bpy.context.active_object, mat_strap)

# ═══════════════════════════════════════════
# 侧面
# ═══════════════════════════════════════════
cs = cube("CardSlot", (W/2-0.001, 0.008, 0), (0.002, 0.018, 0.028))
bevel(cs, 0.001, 2); sm(cs); assign(cs, mat_slot)
cl = cube("CardLine", (W/2+0.0005, 0.008, 0), (0.0005, 0.020, 0.030))
assign(cl, mat_metal_dark)
pc = cube("PortCover", (-W/2+0.001, 0.005, 0.005), (0.002, 0.022, 0.018))
bevel(pc, 0.001, 2); sm(pc); assign(pc, mat_slot)

# ═══════════════════════════════════════════
# 标识
# ═══════════════════════════════════════════
lo = cube("Logo", (0.008, -D/2+0.001, 0.030), (0.022, 0.001, 0.004))
subdiv(lo, 1); sm(lo); assign(lo, mat_white)
ba = cube("Badge", (0.008, -D/2+0.001, 0.023), (0.016, 0.001, 0.002))
sm(ba); assign(ba, mat_white)
eo = cube("EOS", (0.008, -D/2+0.001, 0.036), (0.010, 0.001, 0.002))
sm(eo); assign(eo, mat_white)

# ═══════════════════════════════════════════
# 选中全部
# ═══════════════════════════════════════════
bpy.ops.object.select_all(action='DESELECT')
for o in bpy.data.objects:
    if o.type == 'MESH': o.select_set(True)
bpy.context.view_layer.objects.active = body

# ═══════════════════════════════════════════
# 保存 + 导出
# ═══════════════════════════════════════════
print("Canon R6 Mark II 完整精致版 OK!")

bd = os.path.dirname(bpy.data.filepath) if bpy.data.filepath else os.path.expanduser("~")
bp = os.path.join(bd, "canon_r6m2.blend")
bpy.ops.wm.save_as_mainfile(filepath=bp)
print(f"Blend: {bp}")

bm = r"C:\Users\javam\Documents\blog\个人blog液态玻璃模糊\public\models"
os.makedirs(bm, exist_ok=True)
gp = os.path.join(bm, "canon-r6m2.glb")
bpy.ops.export_scene.gltf(filepath=gp, export_format='GLB', use_selection=False,
    export_apply=True, export_materials='EXPORT', export_colors=True)
print(f"GLB: {gp}")
print("刷新 /exhibition")
