import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Image as ImageIcon,
  Palette,
  SlidersHorizontal,
  CheckCircle2,
  Settings2,
  Save,
  Eye,
  Sparkles,
  Layers3,
  ChevronDown,
  Package,
  CircleDollarSign,
  Clock3,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const hookOptions = [
  { id: 'din2_h', name: 'H-образен DIN2', price: 1850, labor: 3.2, note: 'Стандартен и най-търсен вариант' },
  { id: 'din2_round', name: 'Кръгъл DIN2', price: 1690, labor: 2.8, note: 'По-икономична конфигурация' },
  { id: 'din3_heavy', name: 'DIN3 Heavy Duty', price: 2490, labor: 4.4, note: 'За по-тежки натоварвания' },
];

const rollerOptions = [
  { id: 'steel', name: 'Стоманени ролки', delta: 0 },
  { id: 'polyamide', name: 'Полиамидни ролки', delta: 420 },
  { id: 'polyurethane', name: 'Полиуретанови ролки', delta: 560 },
];

const colorOptions = [
  { id: 'ral9005', name: 'RAL 9005', hex: '#0f172a', delta: 0 },
  { id: 'ral7016', name: 'RAL 7016', hex: '#334155', delta: 95 },
  { id: 'ral3020', name: 'RAL 3020', hex: '#dc2626', delta: 140 },
  { id: 'galvanized', name: 'Raw / Galvanized', hex: '#9ca3af', delta: -80 },
];

const floorOptions = [
  { id: 'steel', name: 'Steel floor', delta: 0 },
  { id: 'plywood', name: 'Plywood floor', delta: -220 },
  { id: 'hybrid', name: 'Hybrid floor', delta: 160 },
];

export default function OptionEditor_Showcase_Rev1() {
  const [hook, setHook] = useState('din2_h');
  const [roller, setRoller] = useState('steel');
  const [color, setColor] = useState('ral7016');
  const [floor, setFloor] = useState('steel');
  const [length, setLength] = useState('6200');
  const [printLogo, setPrintLogo] = useState(true);
  const [autoDocs, setAutoDocs] = useState(true);
  const [premiumPreview, setPremiumPreview] = useState(false);

  const hookData = hookOptions.find((x) => x.id === hook)!;
  const rollerData = rollerOptions.find((x) => x.id === roller)!;
  const colorData = colorOptions.find((x) => x.id === color)!;
  const floorData = floorOptions.find((x) => x.id === floor)!;

  const pricing = useMemo(() => {
    const base = 28450;
    const lengthNum = Number(length) || 6200;
    const lengthDelta = Math.max(0, lengthNum - 6200) * 1.85;
    const printDelta = printLogo ? 380 : 0;
    const previewDelta = premiumPreview ? 90 : 0;
    const subtotal =
      base +
      hookData.price +
      rollerData.delta +
      colorData.delta +
      floorData.delta +
      lengthDelta +
      printDelta +
      previewDelta;

    const managerMargin = subtotal * 0.12;
    const final = subtotal + managerMargin;
    const labor = 34 + hookData.labor + (printLogo ? 0.8 : 0) + (roller === 'polyurethane' ? 0.6 : 0);

    return {
      base,
      lengthDelta,
      printDelta,
      previewDelta,
      subtotal,
      managerMargin,
      final,
      labor,
    };
  }, [length, printLogo, premiumPreview, hookData, rollerData, colorData, floorData, roller]);

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <Card className="overflow-hidden rounded-3xl border-0 shadow-xl">
            <CardHeader className="border-b bg-white/90 pb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge className="rounded-full bg-lime-300 px-3 py-1 text-slate-900 hover:bg-lime-300">
                      DP Design Pilot
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">Option Editor</Badge>
                  </div>
                  <CardTitle className="text-2xl font-semibold text-slate-900">
                    ABTRPR / Захват и ходова конфигурация
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">
                    Един фокусиран екран за избор, визуализация и бизнес ефект — без шум и без тежки таблици.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-2xl bg-white">
                    <Eye className="mr-2 h-4 w-4" />
                    Viewer mode
                  </Button>
                  <Button variant="outline" className="rounded-2xl bg-white">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Генерирай изображение
                  </Button>
                  <Button className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
                    <Save className="mr-2 h-4 w-4" />
                    Запази опцията
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid gap-0 xl:grid-cols-[1fr_320px]">
                <div className="relative min-h-[430px] bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_48%,#020617_100%)] p-4 md:p-6">
                  <div className="absolute left-5 top-5 flex gap-2">
                    <Badge className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/10">
                      <Box className="mr-1.5 h-3.5 w-3.5" /> Multi-GLB scene
                    </Badge>
                    <Badge className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/10">
                      <Layers3 className="mr-1.5 h-3.5 w-3.5" /> Live modules
                    </Badge>
                  </div>

                  <div className="flex h-full items-center justify-center">
                    <div className="relative h-[340px] w-full max-w-[780px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-30" />

                      <div className="absolute bottom-10 left-1/2 h-40 w-[78%] -translate-x-1/2 rounded-[30px] border border-white/10 bg-slate-700/90 shadow-2xl" />
                      <div className="absolute bottom-14 left-[18%] h-14 w-24 rounded-2xl bg-slate-500/90 shadow-lg ring-1 ring-white/10" />
                      <div className="absolute bottom-14 right-[18%] h-14 w-24 rounded-2xl bg-slate-500/90 shadow-lg ring-1 ring-white/10" />

                      <div className="absolute bottom-20 left-[10%] h-16 w-16 rounded-full border-4 border-slate-300 bg-slate-600 shadow-lg" />
                      <div className="absolute bottom-20 left-[23%] h-16 w-16 rounded-full border-4 border-slate-300 bg-slate-600 shadow-lg" />
                      <div className="absolute bottom-20 right-[23%] h-16 w-16 rounded-full border-4 border-slate-300 bg-slate-600 shadow-lg" />
                      <div className="absolute bottom-20 right-[10%] h-16 w-16 rounded-full border-4 border-slate-300 bg-slate-600 shadow-lg" />

                      <div className="absolute left-[26%] top-[22%] h-32 w-[48%] rounded-[26px] border border-white/10 shadow-xl"
                        style={{ background: `linear-gradient(180deg, ${colorData.hex}, #475569)` }}
                      />

                      <div className="absolute right-[12%] top-[30%] flex h-24 w-24 items-center justify-center rounded-[24px] border border-cyan-300/20 bg-cyan-400/15 shadow-lg backdrop-blur-sm">
                        <Package className="h-10 w-10 text-cyan-200" />
                      </div>

                      <div className="absolute left-5 bottom-5 rounded-2xl bg-black/35 px-3 py-2 text-xs text-slate-200 backdrop-blur-sm">
                        Active hook: <span className="font-semibold text-white">{hookData.name}</span>
                      </div>

                      <div className="absolute right-5 bottom-5 rounded-2xl bg-black/35 px-3 py-2 text-xs text-slate-200 backdrop-blur-sm">
                        Roller set: <span className="font-semibold text-white">{rollerData.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-l bg-white p-4 md:p-5">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <Card className="rounded-2xl border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-semibold">Визуален профил</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Един и същ GLB asset може да живее в конфигуратор, админ екран, оферта и viewer mode.
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-sm font-semibold">Бизнес контрол</span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Мениджърите редактират стойности. Инженерният модел само подава истината за конфигурацията.
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Palette className="h-4 w-4" /> Активен finish
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setColor(item.id)}
                            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition ${
                              color === item.id
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-black/10"
                              style={{ backgroundColor: item.hex }}
                            />
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-4"
        >
          <Card className="rounded-3xl border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <Settings2 className="h-5 w-5" />
                Редактор на опцията
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Тип захват</Label>
                <Select value={hook} onValueChange={setHook}>
                  <SelectTrigger className="h-11 rounded-2xl">
                    <SelectValue placeholder="Избери захват" />
                  </SelectTrigger>
                  <SelectContent>
                    {hookOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">{hookData.note}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ролки</Label>
                  <Select value={roller} onValueChange={setRoller}>
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue placeholder="Избери ролки" />
                    </SelectTrigger>
                    <SelectContent>
                      {rollerOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Тип дъно</Label>
                  <Select value={floor} onValueChange={setFloor}>
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue placeholder="Избери дъно" />
                    </SelectTrigger>
                    <SelectContent>
                      {floorOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Дължина на изделието</Label>
                <div className="relative">
                  <Input
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="h-11 rounded-2xl pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">mm</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl border p-3">
                  <div>
                    <div className="font-medium text-slate-900">Печат / брандиране</div>
                    <div className="text-xs text-slate-500">Лого и визуална подготовка за офертен preview</div>
                  </div>
                  <Switch checked={printLogo} onCheckedChange={setPrintLogo} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border p-3">
                  <div>
                    <div className="font-medium text-slate-900">AutoDocs пакет</div>
                    <div className="text-xs text-slate-500">PDF / DXF / спецификация при потвърждение</div>
                  </div>
                  <Switch checked={autoDocs} onCheckedChange={setAutoDocs} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border p-3">
                  <div>
                    <div className="font-medium text-slate-900">Photo mode preview</div>
                    <div className="text-xs text-slate-500">По-качествено snapshot изображение при поискване</div>
                  </div>
                  <Switch checked={premiumPreview} onCheckedChange={setPremiumPreview} />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900">
                  <SlidersHorizontal className="h-4 w-4" />
                  Екранът е фокусиран само върху релевантните полета за тази опция.
                </div>
                Без таблица, без шум, без риск да се изгуби човекът в 40 колони.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                <CircleDollarSign className="h-5 w-5" />
                Ефект от избора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-900 p-4 text-white">
                  <div className="text-xs uppercase tracking-wide text-slate-300">Крайна цена</div>
                  <div className="mt-2 text-2xl font-semibold">{pricing.final.toFixed(0)} лв</div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400">Себестойност</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{pricing.subtotal.toFixed(0)} лв</div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" /> Труд
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{pricing.labor.toFixed(1)} ч</div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-semibold text-slate-900">Разбивка</div>
                  <Badge variant="secondary" className="rounded-full">
                    Manager editable
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <Row label="Базово изделие" value={`${pricing.base.toFixed(0)} лв`} />
                  <Row label={hookData.name} value={`+${hookData.price.toFixed(0)} лв`} />
                  <Row label={rollerData.name} value={`${rollerData.delta >= 0 ? '+' : ''}${rollerData.delta.toFixed(0)} лв`} />
                  <Row label={colorData.name} value={`${colorData.delta >= 0 ? '+' : ''}${colorData.delta.toFixed(0)} лв`} />
                  <Row label={floorData.name} value={`${floorData.delta >= 0 ? '+' : ''}${floorData.delta.toFixed(0)} лв`} />
                  <Row label="Дължина / надбавка" value={`+${pricing.lengthDelta.toFixed(0)} лв`} />
                  <Row label="Печат / branding" value={`${pricing.printDelta >= 0 ? '+' : ''}${pricing.printDelta.toFixed(0)} лв`} />
                  <Row label="Photo mode" value={`${pricing.previewDelta >= 0 ? '+' : ''}${pricing.previewDelta.toFixed(0)} лв`} />
                  <Separator className="my-2" />
                  <Row label="Марж / търговска логика" value={`+${pricing.managerMargin.toFixed(0)} лв`} strong />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Потвърди конфигурацията
                </Button>
                <Button variant="outline" className="rounded-2xl bg-white">
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Отвори разширени правила
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className={strong ? 'font-semibold text-slate-900' : 'text-slate-600'}>{label}</div>
      <div className={strong ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}>{value}</div>
    </div>
  );
}
